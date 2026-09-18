'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { clearSessionCookie, getCurrentUser, registerAudit, requireRole, setSessionCookie, signSession } from '@/lib/auth';

export async function loginAction(_prevState: { error?: string; success?: boolean }, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const senha = String(formData.get('senha') ?? '').trim();

  if (!email || !senha) {
    return { error: 'Informe e-mail e senha.', success: false };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || usuario.status !== 'ATIVO') {
    return { error: 'Credenciais inválidas.', success: false };
  }

  const isValid = await bcrypt.compare(senha, usuario.senha);
  if (!isValid) {
    return { error: 'Credenciais inválidas.', success: false };
  }

  const token = signSession({ userId: usuario.id, perfil: usuario.perfil as 'GESTOR' | 'FUNCIONARIO', email: usuario.email });
  setSessionCookie(token);

  await registerAudit({
    usuarioId: usuario.id,
    acao: 'LOGIN',
    entidade: 'Usuario',
    entidadeId: usuario.id,
    descricao: `${usuario.nome} acessou o sistema.`,
  });

  redirect(usuario.perfil === 'GESTOR' ? '/dashboard' : '/funcionario');
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    await registerAudit({
      usuarioId: user.id,
      acao: 'LOGOUT',
      entidade: 'Usuario',
      entidadeId: user.id,
      descricao: `${user.nome} saiu do sistema.`,
    });
  }

  clearSessionCookie();
  redirect('/login');
}

export async function createUsuarioAction(formData: FormData) {
  await requireRole(['GESTOR']);

  const nome = String(formData.get('nome') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const senha = String(formData.get('senha') ?? '').trim();
  const cargo = String(formData.get('cargo') ?? 'OPERADOR').trim();
  const perfil = String(formData.get('perfil') ?? 'FUNCIONARIO').trim();

  if (!nome || !email || !senha) {
    throw new Error('Nome, e-mail e senha são obrigatórios.');
  }

  const hash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: hash,
      cargo,
      perfil,
      status: 'ATIVO',
    },
  });

  const gestor = await getCurrentUser();
  if (gestor) {
    await registerAudit({
      usuarioId: gestor.id,
      acao: 'CADASTRO_USUARIO',
      entidade: 'Usuario',
      entidadeId: usuario.id,
      descricao: `Gestor ${gestor.nome} cadastrou ${usuario.nome}.`,
    });
  }

  revalidatePath('/funcionarios');
  redirect('/funcionarios');
}

export async function createOrdemAction(formData: FormData) {
  const gestor = await requireRole(['GESTOR']);

  const produto = String(formData.get('produto') ?? '').trim();
  const quantidadePlanejada = Number(formData.get('quantidadePlanejada') ?? 0);
  const prioridade = String(formData.get('prioridade') ?? 'MEDIA').trim();
  const observacoes = String(formData.get('observacoes') ?? '').trim();
  const prazo = formData.get('prazo') ? new Date(String(formData.get('prazo'))) : null;
  const responsavelId = formData.get('responsavelId') ? Number(formData.get('responsavelId')) : null;
  const maquinaId = formData.get('maquinaId') ? Number(formData.get('maquinaId')) : null;

  if (!produto || !quantidadePlanejada || quantidadePlanejada <= 0) {
    throw new Error('Produto e quantidade são obrigatórios.');
  }

  const ordem = await prisma.ordem.create({
    data: {
      codigo: `OP-${Date.now()}`,
      produto,
      quantidadePlanejada,
      quantidadeProduzida: 0,
      quantidadeRestante: quantidadePlanejada,
      prioridade,
      status: 'AGUARDANDO',
      observacoes: observacoes || null,
      prazo: prazo ?? null,
      maquinaId: maquinaId ?? null,
      responsavelId: responsavelId ?? null,
      criadoPorId: gestor.id,
    },
  });

  await registerAudit({
    usuarioId: gestor.id,
    acao: 'CRIAR_ORDEM',
    entidade: 'Ordem',
    entidadeId: ordem.id,
    descricao: `Gestor ${gestor.nome} criou a OP #${ordem.codigo}.`,
  });

  revalidatePath('/ordens');
  redirect('/ordens');
}

export async function updateOrdemStatusAction(orderId: number, status: string) {
  const gestor = await requireRole(['GESTOR']);

  const ordem = await prisma.ordem.findUnique({ where: { id: orderId } });
  if (!ordem) return;

  await prisma.ordem.update({
    where: { id: orderId },
    data: {
      status,
      dataInicio: status === 'EM_PRODUCAO' && !ordem.dataInicio ? new Date() : ordem.dataInicio,
      dataConclusao: status === 'CONCLUIDA' ? new Date() : ordem.dataConclusao,
      quantidadeRestante: Math.max(0, ordem.quantidadePlanejada - ordem.quantidadeProduzida),
    },
  });

  await registerAudit({
    usuarioId: gestor.id,
    acao: 'ALTERAR_STATUS_ORDEM',
    entidade: 'Ordem',
    entidadeId: ordem.id,
    descricao: `Gestor ${gestor.nome} alterou a OP #${ordem.codigo} para ${status}.`,
  });

  revalidatePath('/ordens');
}

export async function deleteOrdemAction(orderId: number) {
  const gestor = await requireRole(['GESTOR']);
  const ordem = await prisma.ordem.findUnique({ where: { id: orderId } });
  if (!ordem) return;

  await prisma.ordem.delete({ where: { id: orderId } });
  await registerAudit({
    usuarioId: gestor.id,
    acao: 'EXCLUIR_ORDEM',
    entidade: 'Ordem',
    entidadeId: ordem.id,
    descricao: `Gestor ${gestor.nome} cancelou a OP #${ordem.codigo}.`,
  });

  revalidatePath('/ordens');
}

export async function createTarefaAction(formData: FormData) {
  const gestor = await requireRole(['GESTOR']);

  const titulo = String(formData.get('titulo') ?? '').trim();
  const descricao = String(formData.get('descricao') ?? '').trim();
  const prioridade = String(formData.get('prioridade') ?? 'MEDIA').trim();
  const prazo = formData.get('prazo') ? new Date(String(formData.get('prazo'))) : null;
  const responsavelId = formData.get('responsavelId') ? Number(formData.get('responsavelId')) : null;

  if (!titulo || !descricao) {
    throw new Error('Título e descrição são obrigatórios.');
  }

  const tarefa = await prisma.tarefa.create({
    data: {
      titulo,
      descricao,
      prioridade,
      prazo: prazo ?? null,
      responsavelId: responsavelId ?? null,
      criadaPorId: gestor.id,
      status: 'PENDENTE',
    },
  });

  await registerAudit({
    usuarioId: gestor.id,
    acao: 'CRIAR_TAREFA',
    entidade: 'Tarefa',
    entidadeId: tarefa.id,
    descricao: `Gestor ${gestor.nome} criou a tarefa #${tarefa.id}.`,
  });

  revalidatePath('/tarefas');
  redirect('/tarefas');
}

export async function updateTarefaStatusAction(taskId: number, status: string) {
  const usuario = await requireRole(['GESTOR', 'FUNCIONARIO']);

  const tarefa = await prisma.tarefa.findUnique({ where: { id: taskId } });
  if (!tarefa) return;

  if (usuario.perfil === 'FUNCIONARIO' && tarefa.responsavelId !== usuario.id) {
    throw new Error('Você só pode alterar suas próprias tarefas.');
  }

  const updateData: Record<string, any> = { status };
  if (status === 'ACEITA') updateData.aceitaPorId = usuario.id;
  if (status === 'EM_ANDAMENTO') updateData.iniciadaPorId = usuario.id;
  if (status === 'CONCLUIDA') updateData.concluidaPorId = usuario.id;

  await prisma.tarefa.update({
    where: { id: taskId },
    data: updateData,
  });

  await registerAudit({
    usuarioId: usuario.id,
    acao: status,
    entidade: 'Tarefa',
    entidadeId: tarefa.id,
    descricao: `${usuario.nome} alterou a tarefa #${tarefa.id} para ${status}.`,
  });

  revalidatePath('/tarefas');
  revalidatePath('/funcionario/tarefas');
}

export async function createPedidoAction(formData: FormData) {
  const usuario = await requireRole(['FUNCIONARIO']);

  const tipo = String(formData.get('tipo') ?? '').trim();
  const titulo = String(formData.get('titulo') ?? '').trim();
  const descricao = String(formData.get('descricao') ?? '').trim();
  const prioridade = String(formData.get('prioridade') ?? 'MEDIA').trim();
  const observacao = String(formData.get('observacao') ?? '').trim();

  if (!tipo || !titulo || !descricao) {
    throw new Error('Tipo, título e descrição são obrigatórios.');
  }

  const pedido = await prisma.pedido.create({
    data: {
      tipo,
      titulo,
      descricao,
      prioridade,
      observacao: observacao || null,
      usuarioId: usuario.id,
      status: 'ABERTO',
    },
  });

  await registerAudit({
    usuarioId: usuario.id,
    acao: 'CRIAR_PEDIDO',
    entidade: 'Pedido',
    entidadeId: pedido.id,
    descricao: `${usuario.nome} criou o pedido #${pedido.id}.`,
  });

  revalidatePath('/funcionario/pedidos');
  redirect('/funcionario/pedidos');
}

export async function createOcorrenciaAction(formData: FormData) {
  const usuario = await requireRole(['FUNCIONARIO']);

  const tipo = String(formData.get('tipo') ?? '').trim();
  const titulo = String(formData.get('titulo') ?? '').trim();
  const descricao = String(formData.get('descricao') ?? '').trim();
  const prioridade = String(formData.get('prioridade') ?? 'MEDIA').trim();
  const maquinaId = formData.get('maquinaId') ? Number(formData.get('maquinaId')) : null;

  if (!tipo || !titulo || !descricao) {
    throw new Error('Tipo, título e descrição são obrigatórios.');
  }

  const ocorrencia = await prisma.ocorrencia.create({
    data: {
      tipo,
      titulo,
      descricao,
      prioridade,
      maquinaId: maquinaId ?? null,
      usuarioId: usuario.id,
      status: 'ABERTA',
    },
  });

  await registerAudit({
    usuarioId: usuario.id,
    acao: 'ABRIR_OCORRENCIA',
    entidade: 'Ocorrencia',
    entidadeId: ocorrencia.id,
    descricao: `${usuario.nome} abriu a ocorrência #${ocorrencia.id}.`,
  });

  revalidatePath('/funcionario/ocorrencias');
  redirect('/funcionario/ocorrencias');
}

export async function createProdutoAction(formData: FormData) {
  await requireRole(['GESTOR']);

  const nome = String(formData.get('nome') ?? '').trim();
  const codigo = String(formData.get('codigo') ?? '').trim();
  const unidade = String(formData.get('unidade') ?? 'un').trim();
  const estoqueMinimo = Number(formData.get('estoqueMinimo') ?? 0);

  if (!nome || !codigo) {
    throw new Error('Nome e código são obrigatórios.');
  }

  const produto = await prisma.produto.create({
    data: {
      nome,
      codigo,
      unidade,
      estoqueMinimo,
      ativo: true,
    },
  });

  await prisma.estoque.create({
    data: {
      produtoId: produto.id,
      quantidade: 0,
      unidade,
      estoqueMinimo,
      status: 'NORMAL',
    },
  });

  revalidatePath('/estoque');
  redirect('/estoque');
}

export async function createMovimentacaoAction(formData: FormData) {
  const gestor = await requireRole(['GESTOR']);

  const produtoId = Number(formData.get('produtoId'));
  const tipo = String(formData.get('tipo') ?? 'ENTRADA').trim();
  const quantidade = Number(formData.get('quantidade') ?? 0);
  const observacao = String(formData.get('observacao') ?? '').trim();

  if (!produtoId || !quantidade) {
    throw new Error('Produto e quantidade são obrigatórios.');
  }

  const estoque = await prisma.estoque.findUnique({ where: { produtoId } });
  if (!estoque) return;

  const novaQuantidade = tipo === 'SAIDA' ? estoque.quantidade - quantidade : estoque.quantidade + quantidade;

  await prisma.estoque.update({
    where: { produtoId },
    data: {
      quantidade: Math.max(0, novaQuantidade),
      status: novaQuantidade <= estoque.estoqueMinimo ? 'BAIXO' : 'NORMAL',
    },
  });

  await prisma.movimentoEstoque.create({
    data: {
      produtoId,
      estoqueId: estoque.id,
      tipo,
      quantidade,
      observacao: observacao || null,
      usuarioId: gestor.id,
    },
  });

  await registerAudit({
    usuarioId: gestor.id,
    acao: 'MOVIMENTACAO_ESTOQUE',
    entidade: 'Estoque',
    entidadeId: produtoId,
    descricao: `${gestor.nome} registrou ${tipo.toLowerCase()} de ${quantidade} no estoque.`,
  });

  revalidatePath('/estoque');
  redirect('/estoque');
}

export async function createMaquinaAction(formData: FormData) {
  await requireRole(['GESTOR']);

  const nome = String(formData.get('nome') ?? '').trim();
  const codigo = String(formData.get('codigo') ?? '').trim();
  const setor = String(formData.get('setor') ?? 'PRODUCAO').trim();
  const capacidade = Number(formData.get('capacidade') ?? 0);
  const observacao = String(formData.get('observacao') ?? '').trim();

  if (!nome || !codigo) throw new Error('Nome e código são obrigatórios.');

  await prisma.maquina.create({
    data: {
      nome,
      codigo,
      setor,
      capacidade,
      observacao: observacao || null,
      status: 'DISPONIVEL',
    },
  });

  revalidatePath('/maquinas');
  redirect('/maquinas');
}

export async function createPlanejamentoAction(formData: FormData) {
  await requireRole(['GESTOR']);

  const ordemId = Number(formData.get('ordemId'));
  const maquinaId = Number(formData.get('maquinaId'));
  const data = formData.get('data') ? new Date(String(formData.get('data'))) : new Date();
  const horarioInicio = String(formData.get('horarioInicio') ?? '08:00');
  const horarioFim = String(formData.get('horarioFim') ?? '12:00');

  if (!ordemId || !maquinaId) throw new Error('Ordem e máquina são obrigatórios.');

  await prisma.planejamento.create({
    data: {
      ordemId,
      maquinaId,
      data,
      horarioInicio,
      horarioFim,
      status: 'PLANEJADO',
    },
  });

  revalidatePath('/planejamento');
  redirect('/planejamento');
}

export async function updatePerfilAction(formData: FormData) {
  const usuario = await requireRole(['GESTOR', 'FUNCIONARIO']);

  const nome = String(formData.get('nome') ?? '').trim();
  const cargo = String(formData.get('cargo') ?? '').trim();

  if (!nome) {
    throw new Error('Nome é obrigatório.');
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      nome,
      cargo: cargo || usuario.cargo,
    },
  });

  revalidatePath('/funcionario/perfil');
  redirect('/funcionario/perfil');
}
