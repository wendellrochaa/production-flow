export function percentual(valor: number, total: number) { return total <= 0 ? 0 : Math.min(100, Math.round((valor / total) * 100)); }
export function data(valor: string) { if (!valor) return "—"; return new Intl.DateTimeFormat("pt-BR").format(new Date(`${valor.length === 10 ? valor + "T12:00:00" : valor}`)); }
export function dataHora(valor?: string) { if (!valor) return "—"; return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor)); }
export function minutosParada(inicio: string, fim?: string) { const end = fim ? new Date(fim).getTime() : Date.now(); return Math.max(0, Math.round((end - new Date(inicio).getTime()) / 60000)); }
