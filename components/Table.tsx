export default function Table({ colunas, linhas, vazio = "Nada por aqui ainda." }: { colunas: string[]; linhas: React.ReactNode[][]; vazio?: string }) {
 if (!linhas.length) return <p className="py-10 text-center text-sm text-apagado">{vazio}</p>;
 return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-risco text-left text-xs text-apagado">{colunas.map(c=><th key={c} className="whitespace-nowrap px-3 py-2 font-medium">{c}</th>)}</tr></thead><tbody>{linhas.map((l,i)=><tr key={i} className="border-b border-risco/60 last:border-0 hover:bg-slate-50">{l.map((c,j)=><td key={j} className="whitespace-nowrap px-3 py-2.5">{c}</td>)}</tr>)}</tbody></table></div>;
}
