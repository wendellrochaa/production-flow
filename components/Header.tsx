export default function Header({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: React.ReactNode }) {
 return <header className="flex flex-wrap items-end justify-between gap-3 border-b border-risco bg-white px-6 py-4"><div><h1 className="text-xl font-bold tracking-tight">{titulo}</h1>{descricao && <p className="text-sm text-apagado">{descricao}</p>}</div><div className="flex items-center gap-3">{acao}<span className="hidden text-sm text-apagado sm:block">Wendell · PCP</span></div></header>;
}
