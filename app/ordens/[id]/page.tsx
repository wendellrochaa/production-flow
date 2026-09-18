"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Card, { Barra } from "@/components/Card";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { useData } from "@/components/DataProvider";
import { data, percentual } from "@/lib/utils";

export default function DetalheOrdem({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { orders, addProduction, updateOrder } = useData();
  const base = orders.find((order) => order.id === Number(params.id));
  const [modal, setModal] = useState(false);
  const [qtd, setQtd] = useState("");

  if (!base) {
    return (
      <>
        <Header titulo="OP não encontrada" />
        <div className="p-6">
          <button onClick={() => router.push("/ordens")} className="text-sinal">
            ← Voltar
          </button>
        </div>
      </>
    );
  }

  // Captura a ordem depois da guarda acima. Dessa forma, funções aninhadas
  // também trabalham com um valor comprovadamente definido.
  const ordem = base;
  const pct = percentual(ordem.produzido, ordem.quantidade);

  function apontar() {
    const quantidade = Number(qtd);
    if (quantidade > 0) {
      addProduction(ordem.id, quantidade);
    }
    setQtd("");
    setModal(false);
  }

  return (
    <>
      <Header
        titulo={`OP #${ordem.id}`}
        descricao={ordem.produto}
        acao={<StatusBadge valor={ordem.status} />}
      />

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <Card titulo="Dados da ordem">
          <div className="space-y-2">
            {[
              ["Produto", ordem.produto],
              ["Código", ordem.codigo],
              ["Quantidade", ordem.quantidade],
              ["Produzido", ordem.produzido],
              ["Responsável", ordem.responsavel],
              ["Máquina", ordem.maquina],
              ["Início", data(ordem.inicio)],
              ["Entrega", data(ordem.entrega)],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex justify-between gap-4 border-b border-risco/60 py-2 text-sm"
              >
                <span className="text-apagado">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card titulo="Andamento">
          <div className="flex items-end justify-between">
            <span className="num text-4xl font-bold">{pct}%</span>
            <span className="num text-sm text-apagado">
              {ordem.produzido} / {ordem.quantidade}
            </span>
          </div>

          <div className="mt-4">
            <Barra percent={pct} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => updateOrder(ordem.id, { status: "EM_PRODUCAO" })}
              className="rounded-lg bg-ok/10 px-3 py-2 text-sm font-semibold text-ok"
            >
              Iniciar
            </button>
            <button
              onClick={() => updateOrder(ordem.id, { status: "PAUSADA" })}
              className="rounded-lg bg-atencao/10 px-3 py-2 text-sm font-semibold text-atencao"
            >
              Pausar
            </button>
            <button
              onClick={() => updateOrder(ordem.id, { status: "FINALIZADA" })}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
            >
              Finalizar
            </button>
            <button
              onClick={() => setModal(true)}
              className="rounded-lg bg-sinal px-3 py-2 text-sm font-semibold text-white"
            >
              Apontar produção
            </button>
          </div>
        </Card>
      </div>

      <Modal
        titulo="Apontar produção"
        aberto={modal}
        aoFechar={() => setModal(false)}
      >
        <label className="block text-sm font-medium">
          Peças produzidas
          <input
            autoFocus
            type="number"
            min="1"
            value={qtd}
            onChange={(event) => setQtd(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-risco px-3 py-2.5"
          />
        </label>
        <button
          onClick={apontar}
          className="mt-4 w-full rounded-lg bg-sinal py-2.5 font-semibold text-white"
        >
          Registrar
        </button>
      </Modal>
    </>
  );
}
