# ProductionFlow — mapa dos blocos

Sistema de PCP em Next.js + Prisma. Cada bloco abaixo é independente: dá pra
construir um de cada vez sem quebrar o resto. Todo arquivo começa com um
cabeçalho dizendo **pra que ele serve** e **com quem ele conversa**.

## Ordem sugerida de construção

| # | Bloco | Arquivos | Pra que serve |
|---|-------|----------|----------------|
| 0 | Base | `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.env.example`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css` | Esqueleto, cores e menu fixo em volta de todas as telas |
| 1 | Login | `app/login/page.tsx` | Identifica quem entrou (ADMIN / PCP / OPERADOR) |
| 2 | Dashboard | `app/dashboard/page.tsx` | Situação da fábrica em 5 segundos: produção do dia, atrasos, paradas |
| 3 | Ordens | `app/ordens/page.tsx`, `app/ordens/nova/page.tsx`, `app/ordens/[id]/page.tsx` | Listar, criar e acompanhar OP (apontar produção, iniciar/pausar/finalizar) |
| 4 | Planejamento | `app/planejamento/page.tsx` | Grade hora × máquina: quem roda quando |
| 5 | Máquinas | `app/maquinas/page.tsx` | Status do parque e envio pra manutenção |
| 6 | Estoque | `app/estoque/page.tsx` | Saldo de matéria-prima, entrada e saída, alerta de mínimo |
| 7 | Ocorrências | `app/ocorrencias/page.tsx` | Parada, falha e atraso — vira tempo parado no relatório |
| 8 | Relatórios | `app/relatorios/page.tsx` | Eficiência, pontualidade, produção por máquina |
| 9 | Banco | `prisma/schema.prisma`, `lib/prisma.ts` | As 7 tabelas e a conexão |
| 10 | Componentes | `components/*.tsx` | Peças reaproveitadas: Sidebar, Header, Card, Table, Modal, StatusBadge |
| 11 | Utilidades | `lib/utils.ts`, `lib/mock.ts` | Cálculos comuns (%, atraso, tempo parado) e dados falsos pra testar |

## Como um dado atravessa o sistema

```
PRODUTO  →  ORDEM  →  PLANEJAMENTO  →  MÁQUINA  →  OCORRÊNCIA
   │          │                                        │
 ESTOQUE   Dashboard ←──────────── indicadores ────────┘
              │
         RELATÓRIOS
```

- Criar OP consome **estoque** (500 peças × 0,5 kg = 250 kg).
- Planejar a OP ocupa uma **máquina** num horário.
- Máquina parada gera **ocorrência**, que aparece no Dashboard e conta minutos.
- Tudo isso vira número nos **relatórios**.

## Rodando

```bash
npm install
cp .env.example .env        # aponte pro seu Postgres
npm run db:push             # cria as tabelas
npm run dev                 # http://localhost:3000
```

As telas já funcionam com `lib/mock.ts` (dados falsos), então dá pra ver tudo
de pé antes do banco existir. Quando o Postgres estiver rodando, troque cada
`import { ordens } from "@/lib/mock"` por uma consulta `prisma.ordem.findMany()`.

## Onde mexer primeiro

Comece pelo bloco 0 + 2 + 3 — Base, Dashboard e Ordens já são um MVP
apresentável. Planejamento, Estoque e Relatórios entram depois.
