'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, registerAudit, requireRole, setSessionCookie, clearSessionCookie } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const senha = String(formData.get('senha') ?? '');

  if (!email || !senha) {
    throw new Error('Email e senha são obrigatórios.');
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || usuario.status !== 'ATIVO') {
    throw new Error('Credenciais inválidas.');
  }

  const validPassword = await bcrypt.compare(senha, usuario.senha);
  if (!validPassword) {
    throw new Error('Credenciais inválidas.');
  }

  const token = require('node:crypto')
    .createHmac('sha256', process.env.SESSION_SECRET || 'development-secret-change-me')
    .update(JSON.stringify({ userId: usuario.id, perfil: usuario.perfil, email: usuario.email }))
    .digest('hex');

  setSessionCookie(`${usuario.id}:${token}`);
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
    throw new Error('Dados do funcionário são obrigatórios.');
  }

  const hash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: hash, cargo, perfil, status: 'ATIVO' },
  });

  const gestor = await getCurrentUser();
  if (gestor) {
    await registerAudit({
      usuarioId: gestor.id,
      acao: 'CADASTRO_USUARIO',
      entidade: 'Usuario',
      entidadeId: usuario.id,
      descricao: `Gestor ${gestor.nome} cadastrou o funcionário ${usuario.nome}.`,
    });
  }

  revalidatePath('/funcionarios');
  redirect('/funcionarios');
}

export async function createOrdemAction(formData: FormData) {
  const user = await requireRole(['GESTOR']);

  const produto = String(formData.get('produto') ?? '').trim();
  const quantidadePlanejada = Number(formData.get('quantidadePlanejada') ?? 0);
  const prioridade = String(formData.get('prioridade') ?? 'MEDIA').trim();
  const observacoes = String(formData.get('observacoes') ?? '').trim();
  const prazo = formData.get('prazo') ? new Date(String(formData.get('prazo'))) : null;
  const maquinaId = formData.get('maquinaId') ? Number(formData.get('maquinaId')) : null;
  const responsavelId = formData.get('responsavelId') ? Number(formData.get('responsavelId')) : null;

  if (!produto || quantidadePlanejada <= 0) {
    throw new Error('Produto e quantidade são obrigatórios.');
  }

  const codigo = `OP-${Date.now()}`;
  const ordem = await prisma.ordem.create({
    data: {
      codigo,
      produto,
      quantidadePlanejada,
      quantidadeRestante: quantidadePlanejada,
      prioridade,
      observacoes: observacoes || null,
      prazo: prazo ?? null,
      maquinaId: maquinaId ?? null,
      responsavelId: responsavelId ?? null,
      criadoPorId: user.id,
      status: 'AGUARDANDO',
      dataInicio: null,
    },
  });

  await registerAudit({
    usuarioId: user.id,
    acao: 'CRIAR_ORDEM',
    entidade: 'Ordem',
    entidadeId: ordem.id,
    descricao: `Gestor ${user.nome} criou a OP #${ordem.codigo}.`,
  });

  revalidatePath('/ordens');
  redirect('/ordens');
}

export async function updateOrdemStatusAction(orderId: number, status: string) {
  const user = await requireRole(['GESTOR']);

  const ordem = await prisma.ordem.findUnique({ where: { id: orderId } });
  if (!ordem) return;

  const dataConclusao = status === 'CONCLUIDA' ? new Date() : ordem.dataConclusao;
  const dataInicio = status === 'EM_PRODUCAO' && !ordem.dataInicio ? new Date() : ordem.dataInicio;

  await prisma.ordem.update({
    where: { id: orderId },
    data: {
      status,
      dataInicio: dataInicio ?? null,
      dataConclusao: dataConclusao ?? null,
      updatedAt: new Date(),
    },
  });

  await registerAudit({
    usuarioId: user.id,
    acao: 'ALTERAR_STATUS_ORDEM',
    entidade: 'Ordem',
    entidadeId: ordem.id,
    descricao: `Gestor ${user.nome} alterou a OP #${ordem.codigo} para ${status}.`,
  });

  revalidatePath('/ordens');
  redirect('/ordens');
}

export async function deleteOrdemAction(orderId: number) {
  const user = await requireRole(['GESTOR']);
  const ordem = await prisma.ordem.findUnique({ where: { id: orderId } });
  if (!ordem) return;

  await prisma.ordem.delete({ where: { id: orderId } });
  await registerAudit({
    usuarioId: user.id,
    acao: 'EXCLUIR_ORDEM',
    entidade: 'Ordem',
    entidadeId: ordem.id,
    descricao: `Gestor ${user.nome} cancelou/excluiu a OP #${ordem.codigo}.`,
  });

  revalidatePath('/ordens');
  redirect('/ordens');
}

export async function createTarefaAction(formData: FormData) {
  const user = await requireRole(['GESTOR']);

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
      criadaPorId: user.id,
      status: 'PENDENTE',
    },
  });

  await registerAudit({
    usuarioId: user.id,
    acao: 'CRIAR_TAREFA',
    entidade: 'Tarefa',
    entidadeId: tarefa.id,
    descricao: `Gestor ${user.nome} criou a tarefa #${tarefa.id}.`,
  });

  revalidatePath('/tarefas');
  redirect('/tarefas');
}

export async function updateTarefaStatusAction(taskId: number, status: string) {
  const user = await requireRole(['GESTOR', 'FUNCIONARIO']);

  const tarefa = await prisma.tarefa.findUnique({ where: { id: taskId } });
  if (!tarefa) return;

  if (user.perfil === 'FUNCIONARIO' && tarefa.responsavelId !== user.id) {
    throw new Error('Você só pode alterar suas próprias tarefas.');
  }

  const payload: Record<string, string | number | null> = { status };
  if (status === 'ACEITA') payload.aceitaPorId = user.id;
  if (status === 'EM_ANDAMENTO') payload.iniciadaPorId = user.id;
  if (status === 'CONCLUIDA') payload.concluidaPorId = user.id;

  await prisma.tarefa.update({
    where: { id: taskId },
    data: payload,
  });

  await registerAudit({
    usuarioId: user.id,
    acao: status,
    entidade: 'Tarefa',
    entidadeId: tarefa.id,
    descricao: `${user.nome} alterou a tarefa #${tarefa.id} para ${status}.`,
  });

  revalidatePath('/tarefas');
  redirect('/funcionario/tarefas');
}

export async function createPedidoAction(formData: FormData) {
  const user = await requireRole(['FUNCIONARIO']);

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
      usuarioId: user.id,
      status: 'ABERTO',
    },
  });

  await registerAudit({
    usuarioId: user.id,
    acao: 'CRIAR_PEDIDO',
    entidade: 'Pedido',
    entidadeId: pedido.id,
    descricao: `${user.nome} criou o pedido #${pedido.id}.`,
  });

  revalidatePath('/funcionario/pedidos');
  redirect('/funcionario/pedidos');
}

export async function createOcorrenciaAction(formData: FormData) {
  const user = await requireRole(['FUNCIONARIO']);

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
      usuarioId: user.id,
      status: 'ABERTA',
    },
  });

  await registerAudit({
    usuarioId: user.id,
    acao: 'ABRIR_OCORRENCIA',
    entidade: 'Ocorrencia',
    entidadeId: ocorrencia.id,
    descricao: `${user.nome} abriu a ocorrência #${ocorrencia.id}.`,
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

export async function adicionarMovimentacaoAction(formData: FormData) {
  const user = await requireRole(['GESTOR']);

  const produtoId = Number(formData.get('produtoId'));
  const tipo = String(formData.get('tipo') ?? 'ENTRADA').trim();
  const quantidade = Number(formData.get('quantidade') ?? 0);
  const observacao = String(formData.get('observacao') ?? '').trim();

  if (!produtoId || !quantidade) {
    throw new Error('Produto e quantidade são obrigatórios.');
  }

  const estoque = await prisma.estoque.findUnique({ where: { produtoId } });
  if (!estoque) return;

  const novoValor = tipo === 'SAIDA' ? estoque.quantidade - quantidade : estoque.quantidade + quantidade;

  await prisma.estoque.update({
    where: { produtoId },
    data: {
      quantidade: Math.max(0, novoValor),
      status: novoValor <= estoque.estoqueMinimo ? 'BAIXO' : 'NORMAL',
    },
  });

  await prisma.movimentoEstoque.create({
    data: {
      produtoId,
      estoqueId: estoque.id,
      tipo,
      quantidade,
      observacao: observacao || null,
      usuarioId: user.id,
    },
  });

  await registerAudit({
    usuarioId: user.id,
    acao: 'MOVIMENTACAO_ESTOQUE',
    entidade: 'Estoque',
    entidadeId: produtoId,
    descricao: `${user.nome} registrou ${tipo.toLowerCase()} de ${quantidade} no estoque.`,
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
    data: { nome, codigo, setor, capacidade, observacao: observacao || null, status: 'DISPONIVEL' },
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
    data: { ordemId, maquinaId, data, horarioInicio, horarioFim, status: 'PLANEJADO' },
  });

  revalidatePath('/planejamento');
  redirect('/planejamento');
}

export async function createRelatorioAction() {
  await requireRole(['GESTOR']);
  redirect('/relatorios');
}

export async function updatePerfilAction(formData: FormData) {
  const user = await requireRole(['GESTOR', 'FUNCIONARIO']);
  const nome = String(formData.get('nome') ?? '').trim();
  const cargo = String(formData.get('cargo') ?? '').trim();

  if (!nome) throw new Error('Nome é obrigatório.');

  await prisma.usuario.update({
    where: { id: user.id },
    data: { nome, cargo: cargo || user.cargo },
  });

  revalidatePath('/funcionario/perfil');
  redirect('/funcionario/perfil');
}
$$
