import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { POLITICA_ATUALIZADA_EM, POLITICA_VERSAO } from "@/lib/config/privacidade";

export const metadata: Metadata = {
  title: "Política de privacidade | Redentor Meridional",
};

/**
 * RASCUNHO: precisa de revisão jurídica e dos dados oficiais da organização
 * (razão social, CNPJ, e-mail) antes de receber contribuição real. Os dados
 * vêm de lib/config/site.ts; o que estiver null aparece como "a confirmar".
 */
export default function Privacy() {
  const controlador = siteConfig.razaoSocial ?? `${siteConfig.nome} (razão social a confirmar)`;
  const cnpj = siteConfig.cnpj ?? "a confirmar";

  return (
    <main className="privacy-page container">
      <Link className="text-link" href="/">
        <ArrowLeft size={17} /> Voltar ao site
      </Link>
      <ShieldCheck size={36} />
      <p className="eyebrow">CUIDADO TAMBÉM COM SEUS DADOS</p>
      <h1>Política de privacidade</h1>
      <p className="privacy-lead">
        Como tratamos os dados de quem contribui com os nossos projetos, conforme a Lei Geral de Proteção de Dados
        (Lei 13.709/2018).
      </p>
      <section>
        <h2>Quem é responsável pelos dados</h2>
        <p>
          {controlador}, CNPJ {cnpj}, {siteConfig.enderecoLinha}. Para qualquer assunto sobre seus dados, escreva para{" "}
          {siteConfig.email} ou fale pelo WhatsApp {siteConfig.whatsapp.exibicao}.
        </p>
      </section>
      <section>
        <h2>Quais dados coletamos e para quê</h2>
        <p>
          Ao contribuir, pedimos nome, e-mail, CPF e, se você quiser, celular. Usamos esses dados para emitir a
          cobrança, confirmar o pagamento, enviar o lembrete mensal da contribuição recorrente no Pix e falar com
          você sobre a sua contribuição. O CPF é exigido pela instituição de pagamento para emitir a cobrança: ele
          vai direto para ela e não fica guardado neste site. Os dados do cartão são digitados na página da
          instituição de pagamento e nunca passam por aqui.
        </p>
      </section>
      <section>
        <h2>Base legal</h2>
        <p>
          Tratamos os dados com o seu consentimento, dado ao marcar a caixa antes de contribuir, e para cumprir
          obrigações legais e fiscais ligadas aos pagamentos. Você pode retirar o consentimento a qualquer momento,
          sem prejuízo do que já foi feito com base nele.
        </p>
      </section>
      <section>
        <h2>Com quem compartilhamos</h2>
        <p>
          Só com quem é necessário para a contribuição funcionar: o Asaas, instituição de pagamento que processa o
          Pix e o cartão; o Supabase, onde guardamos o registro das contribuições; a Vercel, que hospeda o site; e
          a MA24, empresa que desenvolve e mantém o site e atua apenas como operadora, seguindo as nossas
          instruções. Alguns desses serviços podem armazenar dados fora do Brasil, com as garantias previstas na
          LGPD. Não vendemos nem cedemos seus dados para nenhuma outra finalidade.
        </p>
      </section>
      <section>
        <h2>Por quanto tempo guardamos</h2>
        <p>
          Enquanto a sua contribuição recorrente estiver ativa e, depois disso, pelo prazo exigido pela legislação
          fiscal e contábil. Encerrado esse prazo, os dados são apagados.
        </p>
      </section>
      <section>
        <h2>Seus direitos</h2>
        <p>
          Você pode pedir a qualquer momento para confirmar se tratamos seus dados, acessá-los, corrigi-los,
          apagá-los, levá-los para outro serviço ou saber com quem foram compartilhados, entre os outros direitos
          do artigo 18 da LGPD. Basta falar com a gente pelos contatos acima.
        </p>
      </section>
      <section>
        <h2>Cookies e links externos</h2>
        <p>
          O site não usa cookies de análise nem de publicidade. Os únicos cookies são os de acesso ao painel
          interno da equipe. Os links para WhatsApp, Facebook e Google Maps levam a serviços externos, que têm suas
          próprias políticas de privacidade.
        </p>
      </section>
      <section>
        <h2>Versão</h2>
        <p>
          Versão {POLITICA_VERSAO}, atualizada em {POLITICA_ATUALIZADA_EM}. Quando esta política mudar, a nova
          versão será publicada nesta página.
        </p>
      </section>
      <Link className="button button-green" href="/">
        Voltar para os projetos <ArrowLeft size={17} />
      </Link>
    </main>
  );
}
