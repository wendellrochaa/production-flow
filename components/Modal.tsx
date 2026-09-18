"use client";
import { useEffect } from "react";
export default function Modal({ titulo, aberto, aoFechar, children }: { titulo: string; aberto: boolean; aoFechar: () => void; children: React.ReactNode }) {
 useEffect(() => { const f = (e: KeyboardEvent) => e.key === "Escape" && aoFechar(); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [aoFechar]);
 if (!aberto) return null;
 return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={aoFechar}><div className="w-full max-w-lg rounded-xl border border-risco bg-white shadow-2xl" onMouseDown={e => e.stopPropagation()}><div className="flex items-center justify-between border-b border-risco px-5 py-4"><h3 className="font-semibold">{titulo}</h3><button onClick={aoFechar} className="rounded px-2 py-1 text-sm text-apagado hover:bg-painel">Fechar</button></div><div className="p-5">{children}</div></div></div>;
}
