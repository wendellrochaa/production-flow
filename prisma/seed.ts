import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const gestorHash = await bcrypt.hash('Admin123!', 10);
  const funcionarioHash = await bcrypt.hash('Funcionario123!', 10);

  const gestor = await prisma.usuario.upsert({
    where: { email: 'gestor@adm.com' },
    update: {},
    create: {
      nome: 'Gestor Principal',
      email: 'gestor@adm.com',
      senha: gestorHash,
      perfil: 'GESTOR',
      cargo: 'GESTOR',
      status: 'ATIVO',
    },
  });

  const funcionario = await prisma.usuario.upsert({
    where: { email: 'funcionario@funcionario.com' },
    update: {},
    create: {
      nome: 'Funcionário Operador',
      email: 'funcionario@funcionario.com',
      senha: funcionarioHash,
      perfil: 'FUNCIONARIO',
      cargo: 'OPERADOR',
      status: 'ATIVO',
    },
  });

  const produtoAco = await prisma.produto.upsert({
    where: { codigo: 'ACO-01' },
    update: {},
    create: {
      nome: 'Aço Carbono',
      codigo: 'ACO-01',
      unidade: 'kg',
      estoqueMinimo: 100,
      ativo: true,
    },
  });

  const produtoPlastico = await prisma.produto.upsert({
    where: { codigo: 'PLA-01' },
    update: {},
    create: {
      nome: 'Plástico PEAD',
      codigo: 'PLA-01',
      unidade: 'kg',
      estoqueMinimo: 80,
      ativo: true,
    },
  });

  await prisma.estoque.upsert({
    where: { produtoId: produtoAco.id },
    update: {},
    create: {
      produtoId: produtoAco.id,
      quantidade: 350,
      unidade: 'kg',
      estoqueMinimo: 100,
      status: 'NORMAL',
    },
  });

  await prisma.estoque.upsert({
    where: { produtoId: produtoPlastico.id },
    update: {},
    create: {
      produtoId: produtoPlastico.id,
      quantidade: 55,
      unidade: 'kg',
      estoqueMinimo: 80,
      status: 'BAIXO',
    },
  });

  const maquina1 = await prisma.maquina.upsert({
    where: { codigo: 'CNC-01' },
    update: {},
    create: {
      nome: 'CNC 01',
      codigo: 'CNC-01',
      setor: 'FRESAMENTO',
      status: 'EM_PRODUCAO',
      capacidade: 120,
      observacao: 'Máquina principal de fresamento.',
    },
  });

  const maquina2 = await prisma.maquina.upsert({
    where: { codigo: 'PRS-01' },
    update: {},
    create: {
      nome: 'Prensa 01',
      codigo: 'PRS-01',
      setor: 'MONTAGEM',
      status: 'DISPONIVEL',
      capacidade: 90,
      observacao: 'Suporte para montagem.',
    },
  });

  const ordem1 = await prisma.ordem.upsert({
    where: { codigo: 'OP-1001' },
    update: {},
    create: {
      codigo: 'OP-1001',
      produto: 'Suporte de alumínio',
      quantidadePlanejada: 200,
      quantidadeProduzida: 80,
      quantidadeRestante: 120,
      prioridade: 'ALTA',
      status: 'EM_PRODUCAO',
      observacoes: 'Lote inicial para atendimento de cliente.',
      dataInicio: new Date(),
      prazo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      maquinaId: maquina1.id,
      responsavelId: funcionario.id,
      criadoPorId: gestor.id,
    },
  });

  const ordem2 = await prisma.ordem.upsert({
    where: { codigo: 'OP-1002' },
    update: {},
    create: {
      codigo: 'OP-1002',
      produto: 'Conjunto de plástico',
      quantidadePlanejada: 150,
      quantidadeProduzida: 0,
      quantidadeRestante: 150,
      prioridade: 'MEDIA',
      status: 'AGUARDANDO',
      observacoes: 'Aguardando material para iniciar.',
      prazo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      maquinaId: maquina2.id,
      responsavelId: funcionario.id,
      criadoPorId: gestor.id,
    },
  });

  const tarefa1 = await prisma.tarefa.upsert({
    where: { id: 1 },
    update: {},
    create: {
      titulo: 'Ajuste inicial da CNC 01',
      descricao: 'Validar ferramenta e alinhamento do eixo principal.',
      prioridade: 'ALTA',
      status: 'ACEITA',
      prazo: new Date(Date.now() + 1000 * 60 * 60 * 24),
      ordemId: ordem1.id,
      criadaPorId: gestor.id,
      responsavelId: funcionario.id,
      aceitaPorId: funcionario.id,
    },
  });

  const tarefa2 = await prisma.tarefa.upsert({
    where: { id: 2 },
    update: {},
    create: {
      titulo: 'Conferir material de plástico',
      descricao: 'Verificar disponibilidade e qualidade do material antes do início.',
      prioridade: 'MEDIA',
      status: 'PENDENTE',
      prazo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      criadaPorId: gestor.id,
      responsavelId: funcionario.id,
    },
  });

  await prisma.ocorrencia.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tipo: 'MAQUINA',
      titulo: 'Troca de ferramenta',
      descricao: 'Houve necessidade de troca de ferramenta na CNC 01.',
      prioridade: 'MEDIA',
      status: 'ABERTA',
      maquinaId: maquina1.id,
      ordemId: ordem1.id,
      usuarioId: funcionario.id,
    },
  });

  await prisma.pedido.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tipo: 'MATERIAL',
      titulo: 'Solicitação de resina',
      descricao: 'Necessidade de resina para área de manutenção.',
      prioridade: 'ALTA',
      status: 'ABERTO',
      usuarioId: funcionario.id,
      observacao: 'Pedido interno para manutenção.',
    },
  });

  await prisma.planejamento.create({
    data: {
      ordemId: ordem1.id,
      maquinaId: maquina1.id,
      data: new Date(),
      horarioInicio: '08:00',
      horarioFim: '12:00',
      status: 'PLANEJADO',
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: gestor.id,
      acao: 'SEED',
      entidade: 'Usuario',
      entidadeId: gestor.id.toString(),
      descricao: 'Seed inicial executado com usuários e dados de demonstração.',
      ip: '127.0.0.1',
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: funcionario.id,
      acao: 'ACEITAR_TAREFA',
      entidade: 'Tarefa',
      entidadeId: tarefa1.id.toString(),
      descricao: `Funcionário ${funcionario.nome} aceitou a tarefa #${tarefa1.id}.`,
      ip: '127.0.0.1',
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: funcionario.id,
      acao: 'CRIAR_PEDIDO',
      entidade: 'Pedido',
      entidadeId: '1',
      descricao: `Funcionário ${funcionario.nome} abriu pedido de material.`,
      ip: '127.0.0.1',
    },
  });

  console.log('Seed do ProductionFlow finalizado.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
