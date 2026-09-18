import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getDashboardData() {
  const [totalOrdens, aguardando, emProducao, concluidas, atrasadas, totalFuncionarios, ativos, maquinasDisponiveis, maquinasEmProducao, maquinasManutencao, estoqueBaixo, ocorrenciasAbertas, tarefasPendentes, tarefasConcluidas] = await Promise.all([
    prisma.ordem.count(),
    prisma.ordem.count({ where: { status: 'AGUARDANDO' } }),
    prisma.ordem.count({ where: { status: 'EM_PRODUCAO' } }),
    prisma.ordem.count({ where: { status: 'CONCLUIDA' } }),
    prisma.ordem.count({ where: { status: 'ATRASADA' } }),
    prisma.usuario.count(),
    prisma.usuario.count({ where: { status: 'ATIVO' } }),
    prisma.maquina.count({ where: { status: 'DISPONIVEL' } }),
    prisma.maquina.count({ where: { status: 'EM_PRODUCAO' } }),
    prisma.maquina.count({ where: { status: 'MANUTENCAO' } }),
    prisma.estoque.count({ where: { status: 'BAIXO' } }),
    prisma.ocorrencia.count({ where: { status: 'ABERTA' } }),
    prisma.tarefa.count({ where: { status: 'PENDENTE' } }),
    prisma.tarefa.count({ where: { status: 'CONCLUIDA' } }),
  ]);

  return {
    totalOrdens,
    aguardando,
    emProducao,
    concluidas,
    atrasadas,
    totalFuncionarios,
    ativos,
    maquinasDisponiveis,
    maquinasEmProducao,
    maquinasManutencao,
    estoqueBaixo,
    ocorrenciasAbertas,
    tarefasPendentes,
    tarefasConcluidas,
  };
}

export async function getRelatorioStatus() {
  const prodPorFuncionario = await prisma.usuario.findMany({
    where: { perfil: 'FUNCIONARIO' },
    select: { id: true, nome: true, _count: { select: { tarefasResponsavel: true } } },
  });

  return { prodPorFuncionario };
}
