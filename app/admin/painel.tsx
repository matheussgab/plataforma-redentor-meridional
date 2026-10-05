"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Heart,
  LayoutDashboard,
  Repeat2,
  Search,
  Download,
  Users,
  Wallet,
  Info,
  LogOut,
  Leaf,
  Check,
  CalendarDays,
} from "lucide-react";
import { formatarReais as brl } from "@/lib/contribuicoes/valores";
import { sair } from "./entrar/actions";
import type { LinhaContribuicao, LinhaRecorrente } from "./dados";

const STATUS_CONTRIBUICAO: Record<LinhaContribuicao["status"], { nome: string; classe: string }> = {
  pago: { nome: "Confirmada", classe: "" },
  pendente: { nome: "Aguardando", classe: "pending" },
  vencido: { nome: "Vencida", classe: "cancelled" },
  cancelado: { nome: "Cancelada", classe: "cancelled" },
  estornado: { nome: "Estornada", classe: "cancelled" },
};
const STATUS_RECORRENTE: Record<LinhaRecorrente["status"], { nome: string; classe: string }> = {
  ativa: { nome: "Ativa", classe: "" },
  cancelada: { nome: "Cancelada", classe: "cancelled" },
};

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const forma = (f: "pix" | "cartao") => (f === "pix" ? "Pix" : "Cartão");
const iniciais = (nome: string) => {
  const p = nome.split(/\s+/).filter((x) => /^\p{L}/u.test(x));
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
};

/** Célula de CSV segura: aspas escapadas e sem fórmula (=, +, -, @) para planilhas. */
const celula = (valor: string) => {
  const v = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return `"${v.replaceAll('"', '""')}"`;
};

export function Painel({
  demo,
  operador,
  contribuicoes,
  recorrentes,
}: {
  demo: boolean;
  operador: string;
  contribuicoes: LinhaContribuicao[];
  recorrentes: LinhaRecorrente[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "recurring">("overview");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [exported, setExported] = useState(false);
  const [encerrando, setEncerrando] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");

  const busca = search.toLocaleLowerCase("pt-BR");
  const combina = (nome: string, email: string | null) =>
    `${nome} ${email ?? ""}`.toLocaleLowerCase("pt-BR").includes(busca);
  const contribuicoesFiltradas = contribuicoes.filter(
    (c) => (status === "all" || c.status === status) && combina(c.nome, c.email),
  );
  const recorrentesFiltradas = recorrentes.filter(
    (r) => (status === "all" || r.status === status) && combina(r.nome, r.email),
  );

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const pagasMes = contribuicoes.filter((c) => c.status === "pago" && c.pagoEm && new Date(c.pagoEm) >= inicioMes);
  const totalMes = pagasMes.reduce((s, c) => s + c.valorCentavos, 0);
  const recorrenteMes = pagasMes.filter((c) => c.tipo === "recorrente").reduce((s, c) => s + c.valorCentavos, 0);
  const descontosMes = pagasMes.reduce((s, c) => s + (c.repasseCentavos ?? 0), 0);
  const ativas = recorrentes.filter((r) => r.status === "ativa");
  const valorMensalAtivo = ativas.reduce((s, r) => s + r.valorCentavos, 0);
  const periodo = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

  function trocarAba(proxima: "overview" | "recurring") {
    setTab(proxima);
    setStatus("all");
    setExported(false);
  }

  function exportCsv() {
    const linhas =
      tab === "overview"
        ? [
            ["Nome", "E-mail", "Contribuição", "Forma", "Valor", "Status", "Data"],
            ...contribuicoesFiltradas.map((c) => [
              c.nome,
              c.email ?? "",
              c.tipo === "recorrente" ? "Recorrente" : "Única",
              forma(c.forma),
              (c.valorCentavos / 100).toFixed(2).replace(".", ","),
              STATUS_CONTRIBUICAO[c.status].nome,
              data(c.pagoEm ?? c.criadoEm),
            ]),
          ]
        : [
            ["Nome", "E-mail", "Forma", "Valor mensal", "Status", "Início", "Encerramento"],
            ...recorrentesFiltradas.map((r) => [
              r.nome,
              r.email ?? "",
              forma(r.forma),
              (r.valorCentavos / 100).toFixed(2).replace(".", ","),
              STATUS_RECORRENTE[r.status].nome,
              data(r.criadoEm),
              r.canceladoEm ? data(r.canceladoEm) : "",
            ]),
          ];
    if (demo) linhas.unshift(["DADOS FICTICIOS - MODO DEMONSTRACAO"]);
    const blob = new Blob(["﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = tab === "overview" ? "contribuicoes.csv" : "contribuicoes-recorrentes.csv";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  }

  async function encerrar(r: LinhaRecorrente) {
    if (demo) {
      setAviso("Modo demonstração: nada é encerrado de verdade.");
      return;
    }
    if (!window.confirm(`Encerrar a contribuição recorrente de ${r.nome} (${brl(r.valorCentavos)} por mês)? As próximas cobranças deixam de existir.`)) return;
    setEncerrando(r.id);
    setAviso("");
    try {
      const resp = await fetch(`/api/admin/recorrentes/${r.id}/cancelar`, { method: "POST" });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) setAviso(j.erro ?? "Não foi possível encerrar agora.");
      else router.refresh();
    } catch {
      setAviso("Sem conexão. Tente de novo.");
    } finally {
      setEncerrando(null);
    }
  }

  const quantidade = tab === "overview" ? contribuicoesFiltradas.length : recorrentesFiltradas.length;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand">
          <Image src="/logo.png" width={48} height={44} alt="" />
          <span>
            redentor<span>meridional.</span>
          </span>
        </Link>
        <span className="sidebar-label">ESPAÇO DE GESTÃO</span>
        <nav aria-label="Navegação do painel">
          <button className={tab === "overview" ? "active" : ""} onClick={() => trocarAba("overview")}>
            <LayoutDashboard size={18} /> Visão geral
          </button>
          <button className={tab === "recurring" ? "active" : ""} onClick={() => trocarAba("recurring")}>
            <Repeat2 size={18} /> Contribuições recorrentes
          </button>
        </nav>
        <div className="sidebar-bottom">
          <Leaf size={27} />
          <p>
            Organizar o presente.
            <br />
            Cultivar a continuidade.
          </p>
          <Link href="/">
            Ver site público <ArrowUpRight size={15} />
          </Link>
          {!demo && (
            <form action={sair}>
              <button type="submit">
                <LogOut size={16} /> Sair
              </button>
            </form>
          )}
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <span>
            {demo ? (
              <>
                <span className="demo-dot" /> Modo de demonstração
              </>
            ) : (
              operador
            )}
          </span>
          <Link href="/">
            Ir para o site <ArrowUpRight size={15} />
          </Link>
          <span className="admin-avatar">{demo ? "RM" : iniciais(operador)}</span>
          {!demo && (
            <form action={sair} className="header-logout">
              <button type="submit" aria-label="Sair">
                <LogOut size={16} />
              </button>
            </form>
          )}
        </header>
        <main className="admin-content">
          <div className="admin-title">
            <div>
              <p className="eyebrow">GENTE QUE SOMA AO CUIDADO</p>
              <h1>{tab === "overview" ? "Nossa rede, em números." : "Cuidado que continua."}</h1>
              <p>Uma visão das contribuições que mantêm os projetos em movimento.</p>
            </div>
            <span className="admin-period">
              <CalendarDays size={16} /> {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </span>
          </div>
          {demo && (
            <div className="dashboard-notice">
              <Info size={17} />
              <p>Modo demonstração: sem o banco configurado, os nomes e valores abaixo são fictícios.</p>
            </div>
          )}
          <div className="stat-grid">
            <article>
              <span>
                Recebido no mês <Wallet size={19} />
              </span>
              <strong>{brl(totalMes)}</strong>
              <p>
                {pagasMes.length} {pagasMes.length === 1 ? "contribuição confirmada" : "contribuições confirmadas"}
              </p>
            </article>
            <article>
              <span>
                Apoio recorrente <Repeat2 size={19} />
              </span>
              <strong>{brl(valorMensalAtivo)}</strong>
              <p>Por mês, somando as recorrentes ativas</p>
            </article>
            <article>
              <span>
                Contribuintes ativos <Users size={19} />
              </span>
              <strong>
                {ativas.length} <small>{ativas.length === 1 ? "pessoa" : "pessoas"}</small>
              </strong>
              <p>Na contribuição recorrente</p>
            </article>
          </div>
          <div className="admin-middle">
            <article className="fund-card">
              <div>
                <span className="eyebrow">CADA GESTO TEM SEU LUGAR</span>
                <h2>
                  Juntos, mantemos
                  <br />o cuidado vivo.
                </h2>
                <p>
                  Tarifas do pagamento e manutenção do site no mês: {brl(descontosMes)}.
                  <br />
                  Valor líquido recebido: {brl(totalMes - descontosMes)}.
                </p>
              </div>
              <Heart size={95} strokeWidth={0.8} />
            </article>
            <article className="fund-breakdown">
              <h2>Composição do apoio</h2>
              <p>Contribuições confirmadas no mês</p>
              <div className="distribution-bar">
                <span style={{ width: `${totalMes ? (recorrenteMes / totalMes) * 100 : 0}%` }} />
              </div>
              <div>
                <span>
                  <i /> Recorrente
                </span>
                <strong>{brl(recorrenteMes)}</strong>
              </div>
              <div>
                <span>
                  <i /> Contribuição única
                </span>
                <strong>{brl(totalMes - recorrenteMes)}</strong>
              </div>
            </article>
          </div>
          <section className="contributions-table">
            <div className="table-heading">
              <div>
                <h2>{tab === "overview" ? "Histórico de contribuições" : "Contribuições recorrentes"}</h2>
                <p>
                  {tab === "overview"
                    ? "A situação muda sozinha quando o pagamento é confirmado."
                    : "Ativas e encerradas. Encerrar aqui interrompe as próximas cobranças."}
                </p>
              </div>
              <button className="export-button" onClick={exportCsv}>
                <Download size={15} /> Exportar CSV
              </button>
            </div>
            <div className="table-filters">
              <label className="search-field">
                <Search size={16} />
                <input
                  aria-label="Buscar contribuinte"
                  placeholder="Buscar por nome ou e-mail"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label className="status-filter">
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="all">Todos os status</option>
                  {Object.entries(tab === "overview" ? STATUS_CONTRIBUICAO : STATUS_RECORRENTE).map(([valor, s]) => (
                    <option key={valor} value={valor}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {exported && (
              <p className="export-feedback" role="status">
                <Check size={15} /> CSV com os registros filtrados preparado.
              </p>
            )}
            {aviso && (
              <p className="export-feedback admin-alert" role="alert">
                <Info size={15} /> {aviso}
              </p>
            )}
            <div className="table-scroll">
              <table>
                <thead>
                  {tab === "overview" ? (
                    <tr>
                      <th>Contribuinte</th>
                      <th>Data</th>
                      <th>Contribuição</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Contribuinte</th>
                      <th>Início</th>
                      <th>Forma</th>
                      <th>Valor mensal</th>
                      <th>Status</th>
                      <th>
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {tab === "overview"
                    ? contribuicoesFiltradas.map((c) => {
                        const s = STATUS_CONTRIBUICAO[c.status];
                        return (
                          <tr key={c.id}>
                            <td>
                              <Pessoa nome={c.nome} email={c.email} />
                            </td>
                            <td>{data(c.pagoEm ?? c.criadoEm)}</td>
                            <td>
                              {c.tipo === "recorrente" ? "Recorrente" : "Única"} · {forma(c.forma)}
                            </td>
                            <td className="value-cell">{brl(c.valorCentavos)}</td>
                            <td>
                              <span className={`status-badge ${s.classe}`}>
                                <span />
                                {s.nome}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    : recorrentesFiltradas.map((r) => {
                        const s = STATUS_RECORRENTE[r.status];
                        return (
                          <tr key={r.id}>
                            <td>
                              <Pessoa nome={r.nome} email={r.email} />
                            </td>
                            <td>{data(r.criadoEm)}</td>
                            <td>{forma(r.forma)}</td>
                            <td className="value-cell">{brl(r.valorCentavos)}</td>
                            <td>
                              <span className={`status-badge ${s.classe}`}>
                                <span />
                                {s.nome}
                                {r.canceladoEm ? ` em ${data(r.canceladoEm)}` : ""}
                              </span>
                            </td>
                            <td>
                              {r.status === "ativa" && (
                                <button
                                  className="end-button"
                                  disabled={encerrando === r.id}
                                  onClick={() => encerrar(r)}
                                >
                                  {encerrando === r.id ? "Encerrando…" : "Encerrar"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
              {quantidade === 0 && (
                <div className="empty-table">
                  <Search size={25} />
                  <p>
                    {search || status !== "all"
                      ? "Nenhum registro encontrado."
                      : "Nenhuma contribuição ainda. Assim que alguém contribuir pelo site, ela aparece aqui."}
                  </p>
                  {(search || status !== "all") && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setStatus("all");
                      }}
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="table-bottom">
              {quantidade} {quantidade === 1 ? "registro" : "registros"}
              <span>{demo ? "Dados fictícios" : "Valores informados pelo Asaas"}</span>
            </div>
          </section>
          <p className="admin-footer">Redentor Meridional · Cuidado e transparência, lado a lado.</p>
        </main>
      </div>
    </div>
  );
}

function Pessoa({ nome, email }: { nome: string; email: string | null }) {
  return (
    <span className="donor-cell">
      <span className="donor-avatar">{iniciais(nome)}</span>
      <span>
        {nome}
        <small>{email ?? "sem e-mail"}</small>
      </span>
    </span>
  );
}
