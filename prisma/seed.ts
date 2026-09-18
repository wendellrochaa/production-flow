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

  const materialAco = await prisma.produto.upsert({
    where: { codigo: 'ACO-01' },
    update: {},
    create: {
      nome: 'Aço Carbono',
      codigo: 'ACO-01',
      unidade: 'kg',
      estoqueMinimo: 120,
      ativo: true,
    },
  });

  const materialPlastico = await prisma.produto.upsert({
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
    where: { produtoId: materialAco.id },
    update: { quantidade: 320, unidade: 'kg', estoqueMinimo: 120, status: 'NORMAL' },
    create: { produtoId: materialAco.id, quantidade: 320, unidade: 'kg', estoqueMinimo: 120, status: 'NORMAL' },
  });

  await prisma.estoque.upsert({
    where: { produtoId: materialPlastico.id },
    update: { quantidade: 60, unidade: 'kg', estoqueMinimo: 80, status: 'BAIXO' },
    create: { produtoId: materialPlastico.id, quantidade: 60, unidade: 'kg', estoqueMinimo: 80, status: 'BAIXO' },
  });

  const cnc01 = await prisma.maquina.upsert({
    where: { codigo: 'CNC-01' },
    update: {},
    create: { nome: 'CNC 01', codigo: 'CNC-01', setor: 'FRESAMENTO', status: 'EM_PRODUCAO', capacidade: 120, observacao: 'Máquina principal' },
  });

  const prensa01 = await prisma.maquina.upsert({
    where: { codigo: 'PRS-01' },
    update: {},
    create: { nome: 'Prensa 01', codigo: 'PRS-01', setor: 'MONTAGEM', status: 'DISPONIVEL', capacidade: 90, observacao: 'Suporte de componentes' },
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
      observacoes: 'Produção de lote de apoio.',
      dataInicio: new Date(),
      prazo: new Date(Date.now() + 86400000 * 3),
      maquinaId: cnc01.id,
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
      observacoes: 'Aguardando liberação do material.',
      prazo: new Date(Date.now() + 86400000 * 5),
      maquinaId: prensa01.id,
      responsavelId: funcionario.id,
      criadoPorId: gestor.id,
    },
  });

  const tarefa1 = await prisma.tarefa.upsert({
    where: { id: 1 },
    update: {},
    create: {
      titulo: 'Ajuste inicial da máquina CNC 01',
      descricao: 'Validar ajuste e ferramenta para início da produção.',
      prioridade: 'ALTA',
      status: 'ACEITA',
      prazo: new Date(Date.now() + 86400000),
      ordemId: ordem1.id,
      criadaPorId: gestor.id,
      responsavelId: funcionario.id,
      aceitaPorId: funcionario.id,
    },
  });

  await prisma.tarefa.upsert({
    where: { id: 2 },
    update: {},
    create: {
      titulo: 'Conferir material de plástico',
      descricao: 'Verificar quantidade e qualidade antes da produção',
      prioridade: 'MEDIA',
      status: 'PENDENTE',
      prazo: new Date(Date.now() + 86400000 * 2),
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
      descricao: 'Foi necessária troca de ferramenta na CNC 01.',
      prioridade: 'MEDIA',
      status: 'ABERTA',
      maquinaId: cnc01.id,
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
      descricao: 'Necessidade de resina para manutenção da linha.',
      prioridade: 'ALTA',
      status: 'ABERTO',
      usuarioId: funcionario.id,
      observacao: 'Pedido interno para área de manutenção.',
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: gestor.id,
      acao: 'SEED',
      entidade: 'Usuario',
      entidadeId: gestor.id.toString(),
      descricao: 'Seed inicial do sistema ProductionFlow concluído.',
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

  console.log('Seed executado com usuários, máquinas, ordens e dados iniciais.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
