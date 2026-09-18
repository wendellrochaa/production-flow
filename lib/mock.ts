import { Machine, Occurrence, Order, Schedule, StockItem } from "./types";

export const initialOrders: Order[] = [
  { id: 1048, produto: "Peça A-302", codigo: "A302", quantidade: 500, produzido: 320, prioridade: "ALTA", status: "EM_PRODUCAO", responsavel: "João", maquina: "CNC-01", inicio: "2026-09-17", entrega: "2026-09-19" },
  { id: 1049, produto: "Peça B-105", codigo: "B105", quantidade: 300, produzido: 300, prioridade: "NORMAL", status: "FINALIZADA", responsavel: "Carlos", maquina: "Prensa-01", inicio: "2026-09-17", entrega: "2026-09-17" },
  { id: 1050, produto: "Peça C-210", codigo: "C210", quantidade: 800, produzido: 200, prioridade: "ALTA", status: "AGUARDANDO", responsavel: "Marcos", maquina: "CNC-02", inicio: "2026-09-18", entrega: "2026-09-20" },
  { id: 1051, produto: "Suporte D-400", codigo: "D400", quantidade: 420, produzido: 180, prioridade: "BAIXA", status: "ATRASADA", responsavel: "Ana", maquina: "CNC-01", inicio: "2026-09-15", entrega: "2026-09-16" },
];
export const initialMachines: Machine[] = [
  { id: 1, nome: "CNC-01", codigo: "CNC01", status: "PRODUZINDO" },
  { id: 2, nome: "CNC-02", codigo: "CNC02", status: "MANUTENCAO" },
  { id: 3, nome: "Prensa-01", codigo: "PRS01", status: "DISPONIVEL" },
  { id: 4, nome: "Torno-01", codigo: "TRN01", status: "DISPONIVEL" },
];
export const initialStock: StockItem[] = [
  { id: 1, produto: "Aço", codigo: "ACO", quantidade: 300, unidade: "kg", minimo: 100 },
  { id: 2, produto: "Alumínio", codigo: "ALU", quantidade: 120, unidade: "kg", minimo: 100 },
  { id: 3, produto: "Plástico", codigo: "PLA", quantidade: 20, unidade: "kg", minimo: 50 },
  { id: 4, produto: "Parafuso M8", codigo: "P-M8", quantidade: 850, unidade: "un", minimo: 200 },
];
export const initialOccurrences: Occurrence[] = [
  { id: 32, maquina: "CNC-02", ordem: 1050, tipo: "PARADA", descricao: "Falha mecânica", inicio: "2026-09-17T14:20:00" },
  { id: 31, maquina: "CNC-01", ordem: 1048, tipo: "ATRASO", descricao: "Troca de ferramenta", inicio: "2026-09-17T10:10:00", fim: "2026-09-17T10:35:00" },
];
export const initialSchedules: Schedule[] = [
  { id: 1, ordem: 1048, maquina: "CNC-01", data: "2026-09-17", horaInicio: "08:00", horaFim: "10:00" },
  { id: 2, ordem: 1049, maquina: "Prensa-01", data: "2026-09-17", horaInicio: "10:00", horaFim: "13:00" },
  { id: 3, ordem: 1050, maquina: "CNC-02", data: "2026-09-17", horaInicio: "13:00", horaFim: "15:00" },
];
