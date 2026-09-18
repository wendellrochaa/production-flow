"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialMachines, initialOccurrences, initialOrders, initialSchedules, initialStock } from "@/lib/mock";
import { Machine, Occurrence, Order, Schedule, StockItem, MachineStatus, OrderStatus } from "@/lib/types";

type NewOrder = Omit<Order, "id" | "produzido" | "status">;
type ContextValue = {
  orders: Order[]; machines: Machine[]; stock: StockItem[]; occurrences: Occurrence[]; schedules: Schedule[];
  addOrder: (o: NewOrder) => void; updateOrder: (id: number, patch: Partial<Order>) => void; addProduction: (id: number, qty: number) => void;
  updateMachine: (id: number, status: MachineStatus) => void; addStock: (id: number, qty: number) => void; removeStock: (id: number, qty: number) => void;
  addOccurrence: (o: Omit<Occurrence, "id">) => void; closeOccurrence: (id: number) => void; addSchedule: (s: Omit<Schedule, "id">) => void;
  resetData: () => void;
};
const Ctx = createContext<ContextValue | null>(null);
const key = "production-flow-data-v2";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState(initialOrders); const [machines, setMachines] = useState(initialMachines);
  const [stock, setStock] = useState(initialStock); const [occurrences, setOccurrences] = useState(initialOccurrences); const [schedules, setSchedules] = useState(initialSchedules);
  useEffect(() => { try { const raw = localStorage.getItem(key); if (raw) { const d = JSON.parse(raw); setOrders(d.orders); setMachines(d.machines); setStock(d.stock); setOccurrences(d.occurrences); setSchedules(d.schedules); } } catch {} }, []);
  useEffect(() => { localStorage.setItem(key, JSON.stringify({ orders, machines, stock, occurrences, schedules })); }, [orders, machines, stock, occurrences, schedules]);
  const value = useMemo<ContextValue>(() => ({
    orders, machines, stock, occurrences, schedules,
    addOrder: (o) => setOrders(v => [...v, { ...o, id: Math.max(0, ...v.map(x => x.id)) + 1, produzido: 0, status: "AGUARDANDO" }]),
    updateOrder: (id, patch) => setOrders(v => v.map(o => o.id === id ? { ...o, ...patch } : o)),
    addProduction: (id, qty) => setOrders(v => v.map(o => { if (o.id !== id) return o; const produzido = Math.min(o.quantidade, Math.max(0, o.produzido + qty)); const status: OrderStatus = produzido >= o.quantidade ? "FINALIZADA" : o.status === "FINALIZADA" ? "EM_PRODUCAO" : o.status; return { ...o, produzido, status }; })),
    updateMachine: (id, status) => setMachines(v => v.map(m => m.id === id ? { ...m, status } : m)),
    addStock: (id, qty) => setStock(v => v.map(s => s.id === id ? { ...s, quantidade: s.quantidade + Math.max(0, qty) } : s)),
    removeStock: (id, qty) => setStock(v => v.map(s => s.id === id ? { ...s, quantidade: Math.max(0, s.quantidade - Math.max(0, qty)) } : s)),
    addOccurrence: (o) => setOccurrences(v => [...v, { ...o, id: Math.max(0, ...v.map(x => x.id)) + 1 }]),
    closeOccurrence: (id) => setOccurrences(v => v.map(o => o.id === id ? { ...o, fim: new Date().toISOString() } : o)),
    addSchedule: (s) => setSchedules(v => [...v, { ...s, id: Math.max(0, ...v.map(x => x.id)) + 1 }]),
    resetData: () => { setOrders(initialOrders); setMachines(initialMachines); setStock(initialStock); setOccurrences(initialOccurrences); setSchedules(initialSchedules); }
  }), [orders, machines, stock, occurrences, schedules]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useData() { const c = useContext(Ctx); if (!c) throw new Error("useData deve ser usado dentro de DataProvider"); return c; }
