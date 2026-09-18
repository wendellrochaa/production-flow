export default function Card({ titulo, acao, children, className = "" }: { titulo?: string; acao?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-risco bg-painel ${className}`}>{titulo && <header className="flex items-center justify-between border-b border-risco px-4 py-3"><h2 className="text-sm font-semibold">{titulo}</h2>{acao}</header>}<div className="p-4">{children}</div></section>;
}
export function Indicador({ rotulo, valor, tom = "texto", detalhe }: { rotulo: string; valor: string | number; tom?: "texto" | "ok" | "atencao" | "parado"; detalhe?: string }) {
  const cls = { texto: "text-texto", ok: "text-ok", atencao: "text-atencao", parado: "text-parado" }[tom];
  return <div className="rounded-xl border border-risco bg-painel p-4"><p className="text-xs text-apagado">{rotulo}</p><p className={`num mt-1 text-3xl font-semibold ${cls}`}>{valor}</p>{detalhe && <p className="mt-1 text-xs text-apagado">{detalhe}</p>}</div>;
}
export function Barra({ percent }: { percent: number }) { return <div className="h-2 w-full overflow-hidden rounded bg-risco"><div className="h-full rounded bg-sinal transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div>; }
