export type Priority = "BAIXA" | "NORMAL" | "ALTA";
export type OrderStatus = "AGUARDANDO" | "EM_PRODUCAO" | "PAUSADA" | "FINALIZADA" | "ATRASADA";
export type MachineStatus = "DISPONIVEL" | "PRODUZINDO" | "MANUTENCAO";
export type OccurrenceType = "PARADA" | "FALHA" | "ATRASO";

export type Order = {
  id: number; produto: string; codigo: string; quantidade: number; produzido: number;
  prioridade: Priority; status: OrderStatus; responsavel: string; maquina: string;
  inicio: string; entrega: string;
};
export type Machine = { id: number; nome: string; codigo: string; status: MachineStatus; };
export type StockItem = { id: number; produto: string; codigo: string; quantidade: number; unidade: string; minimo: number; };
export type Occurrence = { id: number; maquina: string; ordem?: number; tipo: OccurrenceType; descricao: string; inicio: string; fim?: string; };
export type Schedule = { id: number; ordem: number; maquina: string; data: string; horaInicio: string; horaFim: string; };
