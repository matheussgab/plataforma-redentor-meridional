"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  CreditCard,
  Heart,
  Info,
  QrCode,
  ShieldCheck,
  X,
} from "lucide-react";
import { formatarReais, type Forma, type Tipo } from "@/lib/contribuicoes/valores";
import { cpfValido, mascararCpf, mascararTelefone } from "@/lib/contribuicoes/formato";
import { linkWhatsapp } from "@/lib/config/site";

/**
 * Checkout em três passos: forma de pagamento, dados e pagamento.
 *
 * Tudo que envolve dinheiro é decidido no servidor (POST /api/contribuicao):
 * aqui só vai o CÓDIGO do valor recorrente ou o valor da única. Cartão é
 * digitado na página do Asaas; "pago" só aparece quando o webhook confirma.
 */
export type Pedido = {
  tipo: Tipo;
  /** Recorrente: código de lib/contribuicoes/valores.ts. */
  codigo?: string;
  centavos: number;
};

type Resultado = {
  demo: boolean;
  referencia: string;
  forma: Forma;
  linkPagamento: string;
  pix: { payload: string; imagemBase64: string; expiraEm: string } | null;
};

type Passo = "forma" | "dados" | "pagamento" | "pago";

export function Checkout({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [passo, setPasso] = useState<Passo>("forma");
  const [forma, setForma] = useState<Forma>(pedido.tipo === "recorrente" ? "cartao" : "pix");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const recorrente = pedido.tipo === "recorrente";

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = anterior;
    };
  }, []);

  // Tela do Pix: pergunta a cada 4 s se o webhook já marcou como pago.
  useEffect(() => {
    if (passo !== "pagamento" || !resultado || resultado.forma !== "pix" || resultado.demo) return;
    const timer = setInterval(async () => {
      try {
        const r = await fetch(`/api/contribuicao/status?referencia=${resultado.referencia}`, { cache: "no-store" });
        const j = (await r.json()) as { status?: string };
        if (j.status === "pago") setPasso("pago");
      } catch {
        // rede instável: tenta de novo no próximo ciclo
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [passo, resultado]);

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    const cpfDigitos = cpf.replace(/\D/g, "");
    const telDigitos = telefone.replace(/\D/g, "");
    if (nome.trim().length < 2) return setErro("Informe seu nome.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErro("Informe um e-mail válido.");
    if (!cpfValido(cpfDigitos)) return setErro("Confira o CPF: ele é necessário para emitir a cobrança.");
    if (telDigitos && telDigitos.length < 10) return setErro("Confira o telefone com DDD, ou deixe em branco.");
    if (!consentimento) return setErro("Para continuar, aceite a Política de Privacidade.");

    setErro("");
    setEnviando(true);
    try {
      const r = await fetch("/api/contribuicao", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tipo: pedido.tipo,
          forma,
          codigo: pedido.codigo,
          valorCentavos: recorrente ? undefined : pedido.centavos,
          nome: nome.trim(),
          email: email.trim(),
          cpf: cpfDigitos,
          telefone: telDigitos,
          consentimento,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErro(j.erro ?? "Não conseguimos gerar a contribuição agora.");
        return;
      }
      setResultado(j as Resultado);
      setPasso("pagamento");
    } catch {
      setErro("Sem conexão. Confira sua internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  const resumo = (
    <div className="contribution-summary">
      <span>{recorrente ? "Contribuição recorrente" : "Contribuição única"}</span>
      <strong>
        {formatarReais(pedido.centavos)}
        {recorrente && <small> / mês</small>}
      </strong>
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      className="donation-dialog"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <button type="button" className="dialog-close" aria-label="Fechar" onClick={onClose}>
        <X size={22} />
      </button>

      {passo === "forma" && (
        <>
          <span className="dialog-icon">
            <Heart size={28} />
          </span>
          <p className="eyebrow">UM GESTO QUE ACOLHE</p>
          <h2 id="dialog-title">
            Seu cuidado
            <br />
            faz a diferença.
          </h2>
          {resumo}
          <p className="payment-label">Forma de pagamento</p>
          <div className="payment-options" role="group" aria-label="Forma de pagamento">
            {(["pix", "cartao"] as const).map((f) => (
              <button
                type="button"
                key={f}
                aria-pressed={forma === f}
                className={forma === f ? "selected" : ""}
                onClick={() => setForma(f)}
              >
                {f === "pix" ? <QrCode size={20} /> : <CreditCard size={20} />}
                {f === "pix" ? "Pix" : "Cartão"}
                {forma === f && <Check size={16} />}
              </button>
            ))}
          </div>
          <div className="preview-notice">
            <Info size={20} />
            <p>
              {recorrente && forma === "cartao" && (
                <>
                  <strong>Cobrança automática todo mês.</strong>Você cadastra o cartão uma vez, na página
                  segura do Asaas, e pode encerrar quando quiser falando com a gente.
                </>
              )}
              {recorrente && forma === "pix" && (
                <>
                  <strong>No Pix, a cobrança não é automática.</strong>Todo mês você recebe por e-mail um
                  novo Pix para pagar. Se preferir não se preocupar, escolha o cartão.
                </>
              )}
              {!recorrente && (
                <>
                  <strong>Pagamento seguro.</strong>
                  {forma === "pix"
                    ? "O código Pix aparece na próxima tela, pronto para pagar no app do seu banco."
                    : "Os dados do cartão são digitados na página segura do Asaas, nunca neste site."}
                </>
              )}
            </p>
          </div>
          <button type="button" className="button button-green" onClick={() => setPasso("dados")}>
            Continuar <ArrowRight size={17} />
          </button>
          <p className="checkout-footnote">
            Uma pequena parte de cada contribuição cobre as tarifas do pagamento e a manutenção do site.
          </p>
        </>
      )}

      {passo === "dados" && (
        <form className="checkout-form" onSubmit={enviar} noValidate>
          <button type="button" className="checkout-back" onClick={() => setPasso("forma")}>
            <ArrowLeft size={15} /> Voltar
          </button>
          <h2 id="dialog-title">Seus dados</h2>
          <p className="checkout-lead">
            {formatarReais(pedido.centavos)}
            {recorrente ? " por mês" : ""} · {forma === "pix" ? "Pix" : "Cartão"}
          </p>
          <label className="checkout-field">
            Nome completo
            <input autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>
          <label className="checkout-field">
            E-mail
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="checkout-field">
            CPF
            <input
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(mascararCpf(e.target.value))}
              required
            />
            <small>Usado só para emitir a cobrança. Não fica guardado neste site.</small>
          </label>
          <label className="checkout-field">
            <span>
              Celular <span className="checkout-optional">(opcional)</span>
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(51) 90000-0000"
              value={telefone}
              onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
            />
          </label>
          <label className="checkout-consent">
            <input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} />
            <span>
              Li e aceito a{" "}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer">
                Política de Privacidade
              </a>{" "}
              e autorizo o uso dos meus dados para processar esta contribuição.
            </span>
          </label>
          {erro && (
            <p className="form-error" role="alert">
              {erro}
            </p>
          )}
          <button type="submit" className="button button-green" disabled={enviando}>
            {enviando ? "Gerando…" : forma === "pix" ? "Gerar Pix" : "Ir para o pagamento"}
            {!enviando && <ArrowRight size={17} />}
          </button>
        </form>
      )}

      {passo === "pagamento" && resultado && (
        <>
          {resultado.demo && (
            <div className="preview-notice">
              <ShieldCheck size={20} />
              <p>
                <strong>Modo demonstração.</strong>Os pagamentos ainda não estão ligados. Nenhum valor foi
                cobrado e nenhum dado foi gravado.
              </p>
            </div>
          )}
          {resultado.forma === "pix" && resultado.pix ? (
            <>
              <h2 id="dialog-title">Pague com Pix</h2>
              <p className="checkout-lead">
                Abra o app do seu banco, escolha Pix e leia o código ou use o copia e cola.
              </p>
              {!resultado.demo && (
                <img
                  className="pix-qr"
                  src={`data:image/png;base64,${resultado.pix.imagemBase64}`}
                  alt="QR Code do Pix"
                  width={220}
                  height={220}
                />
              )}
              <div className="pix-copy">
                <code>{resultado.pix.payload}</code>
                <button type="button" onClick={() => copiar(resultado.pix!.payload)}>
                  {copiado ? <Check size={15} /> : <Copy size={15} />}
                  {copiado ? "Copiado" : "Copiar código"}
                </button>
              </div>
              <p className="pix-wait" role="status">
                {resultado.demo
                  ? "Na versão real, esta tela muda sozinha quando o pagamento é confirmado."
                  : "Assim que o pagamento for confirmado, esta tela muda sozinha."}
              </p>
            </>
          ) : (
            <>
              <h2 id="dialog-title">Falta pouco</h2>
              <p className="checkout-lead">
                O pagamento com cartão é feito na página segura do Asaas. Os dados do cartão não passam por este
                site.
              </p>
              {resultado.demo ? (
                <button type="button" className="button button-green" disabled>
                  Página de pagamento (indisponível na demonstração)
                </button>
              ) : (
                <a className="button button-green" href={resultado.linkPagamento}>
                  Ir para o pagamento seguro <ArrowUpRight size={17} />
                </a>
              )}
            </>
          )}
          <button type="button" className="dialog-back" onClick={onClose}>
            Fechar
          </button>
        </>
      )}

      {passo === "pago" && (
        <>
          <span className="dialog-icon">
            <Check size={28} />
          </span>
          <p className="eyebrow">PAGAMENTO CONFIRMADO</p>
          <h2 id="dialog-title">
            Obrigado por
            <br />
            fazer parte.
          </h2>
          <p className="checkout-lead">
            Sua contribuição de {formatarReais(pedido.centavos)} chegou. Ela ajuda a manter a cozinha acesa e as
            portas abertas.
          </p>
          <a
            className="button button-green"
            href={linkWhatsapp("Olá, acabei de contribuir pelo site e quero acompanhar os projetos.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Acompanhar os projetos <ArrowUpRight size={17} />
          </a>
          <button type="button" className="dialog-back" onClick={onClose}>
            Fechar
          </button>
        </>
      )}
    </dialog>
  );
}
