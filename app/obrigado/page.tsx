import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Heart } from "lucide-react";
import { linkWhatsapp } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Obrigado | Redentor Meridional",
};

/**
 * Para onde o Asaas devolve a pessoa depois de pagar (callback.successUrl).
 * Chegar aqui NÃO prova que o pagamento foi aprovado: quem confirma é o
 * webhook. Por isso o texto agradece sem afirmar que o valor já caiu.
 */
export default function Obrigado() {
  return (
    <main className="privacy-page container">
      <Link className="text-link" href="/">
        <ArrowLeft size={17} /> Voltar ao site
      </Link>
      <Heart size={36} />
      <p className="eyebrow">UM GESTO QUE ACOLHE</p>
      <h1>Obrigado por fazer parte.</h1>
      <p className="privacy-lead">
        Recebemos o seu retorno do pagamento. Assim que a confirmação chegar, sua contribuição passa a ajudar a manter
        a cozinha acesa e as portas abertas. O comprovante vai para o seu e-mail.
      </p>
      <section>
        <h2>Contribuição recorrente</h2>
        <p>
          No cartão, as próximas contribuições acontecem sozinhas, todo mês. No Pix, você recebe por e-mail um novo
          código a cada mês. Para mudar ou encerrar, é só falar com a gente.
        </p>
      </section>
      <a
        className="button button-green"
        href={linkWhatsapp("Olá, acabei de contribuir pelo site e quero acompanhar os projetos.")}
        target="_blank"
        rel="noopener noreferrer"
      >
        Acompanhar os projetos <ArrowUpRight size={17} />
      </a>
    </main>
  );
}
