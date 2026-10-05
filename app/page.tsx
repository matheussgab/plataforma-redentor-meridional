"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  MapPin,
  Menu,
  X,
  Sprout,
  Utensils,
  Shirt,
  HandHeart,
  MessageCircle,
  Check,
  Plus,
  Minus,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import {
  ClothesArt,
  KitchenArt,
  TogetherArt,
} from "@/components/illustrations";
import { Checkout, type Pedido } from "@/components/Checkout";
import { linkWhatsapp as contact } from "@/lib/config/site";
import {
  SUGESTOES_UNICA_CENTAVOS,
  UNICA_MAXIMO_CENTAVOS,
  UNICA_MINIMO_CENTAVOS,
  VALORES_RECORRENTES,
  VALOR_RECORRENTE_PADRAO,
  formatarReais as money,
  recorrentePorCodigo,
} from "@/lib/contribuicoes/valores";
import { lerMoeda, mascararMoeda } from "@/lib/contribuicoes/formato";

const valorPadraoRecorrente = recorrentePorCodigo(VALOR_RECORRENTE_PADRAO)!.centavos;
const links = [
  { href: "#sobre", text: "Quem somos" },
  { href: "#projetos", text: "Nossos projetos" },
  { href: "#ajudar", text: "Como ajudar" },
  { href: "#contato", text: "Contato" },
];
const faqs = [
  [
    "Posso ajudar sem contribuir com dinheiro?",
    "Sim! Você pode doar alimentos, roupas em bom estado ou dedicar um pouco do seu tempo ao voluntariado. Fale com a Natália pelo WhatsApp para saber o que os projetos mais precisam neste momento.",
  ],
  [
    "Como faço para doar alimentos ou roupas?",
    "Combine a entrega com a Natália pelo WhatsApp. Ela pode orientar sobre os alimentos necessários, as condições das roupas e a melhor forma de levar sua doação ao nosso espaço na Cidade Baixa.",
  ],
  [
    "Como funciona o Brechó Solidário?",
    "O brechó vende roupas doadas a preços populares. A renda ajuda a manter a cozinha e os demais serviços de acolhida. Também são doadas roupas para pessoas atendidas pela cozinha. Para visitar, entre em contato pelo WhatsApp.",
  ],
  [
    "Preciso ter experiência para ser voluntário?",
    "A vontade de colaborar é um ótimo começo. Entre em contato para conhecer as atividades, conversar sobre sua disponibilidade e encontrar uma forma de participar.",
  ],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [frequency, setFrequency] = useState<"monthly" | "once">("monthly");
  const [amount, setAmount] = useState<number>(valorPadraoRecorrente);
  const [custom, setCustom] = useState("");
  const [customSelected, setCustomSelected] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [faq, setFaq] = useState<number | null>(0);
  const chosenAmount = customSelected ? lerMoeda(custom) : amount;

  function changeFrequency(next: "monthly" | "once") {
    setFrequency(next);
    setAmount(next === "monthly" ? valorPadraoRecorrente : 5_000);
    setCustomSelected(false);
    setAmountError("");
  }
  function openCheckout() {
    if (frequency === "monthly") {
      const valor = VALORES_RECORRENTES.find((v) => v.centavos === amount);
      if (!valor) return;
      setPedido({ tipo: "recorrente", codigo: valor.codigo, centavos: valor.centavos });
      return;
    }
    if (chosenAmount < UNICA_MINIMO_CENTAVOS || chosenAmount > UNICA_MAXIMO_CENTAVOS) {
      setAmountError(
        `Informe um valor entre ${money(UNICA_MINIMO_CENTAVOS)} e ${money(UNICA_MAXIMO_CENTAVOS)}.`,
      );
      return;
    }
    setAmountError("");
    setPedido({ tipo: "unica", centavos: chosenAmount });
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="topbar">
        <span>Gente que cuida de gente.</span>
        <span>
          <MapPin size={12} /> Cidade Baixa · Porto Alegre, RS
        </span>
      </div>
      <header className="header">
        <div className="container nav-wrap">
          <a
            href="#"
            className="brand"
            aria-label="Redentor Meridional — início"
          >
            <Image src="/logo.png" width={57} height={52} alt="" priority />
            <span>
              redentor
              <span>
                meridional<span className="brand-dot">.</span>
              </span>
            </span>
          </a>
          <nav aria-label="Navegação principal" className="desktop-nav">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.text}
              </a>
            ))}
          </nav>
          <a className="button button-green nav-donate" href="#contribua">
            Quero contribuir <Heart size={16} />
          </a>
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Navegação mobile"
          >
            {[...links, { href: "#contribua", text: "Quero contribuir" }].map(
              (link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.text}
                  <ArrowUpRight size={17} />
                </a>
              ),
            )}
          </nav>
        )}
      </header>

      <main id="conteudo">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="little-line" /> SOLIDARIEDADE QUE FAZ PARTE DO
              BAIRRO
            </p>
            <h1>
              Cuidar começa
              <br />
              com <em>a gente.</em>
              <span className="title-spark" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p className="hero-description">
              Um prato de comida. Uma roupa que ganha nova vida. Um gesto que
              acolhe. Juntos, fazemos a solidariedade acontecer na Cidade Baixa.
            </p>
            <div className="hero-actions">
              <a className="button button-green" href="#contribua">
                Faça parte dessa história <ArrowUpRight size={19} />
              </a>
              <a className="text-link" href="#projetos">
                Conheça os projetos <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-note">
              <span className="tiny-heart">
                <Heart size={16} />
              </span>
              <span>
                Pequenos gestos. <strong>Novos começos.</strong>
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-caption">
              <span className="caption-dot" /> FEITO DE CUIDADO, TODOS OS DIAS
            </div>
            <KitchenArt />
            <div className="round-stamp">
              <Heart size={22} />
              <span>
                DE MÃOS DADAS
                <br />
                PELO BEM COMUM
              </span>
              <span className="stamp-stars">✦ &nbsp; ✦ &nbsp; ✦</span>
            </div>
            <div className="art-sticker">
              <span>Onde tem partilha,</span>
              <strong>tem recomeço.</strong>
              <svg viewBox="0 0 135 15" aria-hidden="true">
                <path
                  d="M3 10C30 2 91 0 132 8M18 13c32-5 65-5 99-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </section>

        <div className="values-strip">
          <div className="container">
            <span>
              <Utensils /> Alimentar com dignidade
            </span>
            <span className="strip-star">✳</span>
            <span>
              <Shirt /> Ressignificar e compartilhar
            </span>
            <span className="strip-star">✳</span>
            <span>
              <HandHeart /> Acolher sem distinção
            </span>
          </div>
        </div>

        <section id="sobre" className="section about container">
          <div>
            <p className="eyebrow">NOSSA ESSÊNCIA</p>
            <h2>
              Mais que um espaço.
              <br />
              Uma <em>rede de cuidado.</em>
            </h2>
          </div>
          <div className="about-copy">
            <p>
              Acreditamos que ninguém deveria enfrentar as dificuldades sozinho.
              Por isso, reunimos pessoas, iniciativas e vontade de transformar a
              realidade ao nosso redor.
            </p>
            <p>
              Funcionamos no espaço da Paróquia do Redentor, na Cidade Baixa, em
              Porto Alegre. É aqui que a comida vira acolhimento e a
              solidariedade encontra um lugar para acontecer.
            </p>
            <a
              className="text-link"
              href={contact(
                "Olá, vim pelo site e gostaria de conhecer melhor os projetos.",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Venha conhecer a gente <ArrowUpRight size={18} />
            </a>
          </div>
        </section>

        <section id="projetos" className="projects section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">O CUIDADO NA PRÁTICA</p>
                <h2>
                  Duas iniciativas.
                  <br />
                  <em>Muitas vidas conectadas.</em>
                </h2>
              </div>
              <p>
                Cada projeto é um jeito de estar perto.
                <br />E todos precisam de mãos como as suas.
              </p>
            </div>
            <div className="project-grid">
              <article className="project-card kitchen-card" id="cozinha">
                <div className="project-visual">
                  <span className="project-pill">
                    <Utensils size={14} /> ALIMENTO É UM DIREITO
                  </span>
                  <KitchenArt />
                  <span className="project-number">01</span>
                </div>
                <div className="project-content">
                  <h3>Cozinha Solidária</h3>
                  <p>
                    Comida de verdade, preparada com cuidado. Centenas de
                    marmitas por semana levam alimento e dignidade a pessoas em
                    vulnerabilidade social.
                  </p>
                  <div className="project-tags">
                    <span>Alimentação</span>
                    <span>Dignidade</span>
                    <span>Comunidade</span>
                  </div>
                  <details>
                    <summary>
                      Conheça a cozinha <Plus size={18} />
                    </summary>
                    <div className="project-detail">
                      <p>
                        Desde março de 2025, a cozinha acontece em parceria com
                        o MTD, a Associação Carlos Dorneles e o CAMP.
                        Voluntários e doações de alimentos tornam esse trabalho
                        possível.
                      </p>
                      <a
                        className="text-link"
                        href={contact(
                          "Olá, vim pelo site e quero ajudar a Cozinha Solidária.",
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Quero ajudar a cozinha <ArrowUpRight size={17} />
                      </a>
                    </div>
                  </details>
                </div>
              </article>
              <article className="project-card clothes-card" id="brecho">
                <div className="project-visual">
                  <span className="project-pill">
                    <Shirt size={14} /> NOVAS HISTÓRIAS, NOVOS COMEÇOS
                  </span>
                  <ClothesArt />
                  <span className="project-number">02</span>
                </div>
                <div className="project-content">
                  <h3>Brechó Solidário</h3>
                  <p>
                    Roupas que circulam, cuidado que se multiplica. Peças doadas
                    ganham novos donos a preços populares e ajudam a sustentar a
                    cozinha e a acolhida.
                  </p>
                  <div className="project-tags">
                    <span>Consumo consciente</span>
                    <span>Solidariedade</span>
                  </div>
                  <details>
                    <summary>
                      Conheça o brechó <Plus size={18} />
                    </summary>
                    <div className="project-detail">
                      <p>
                        Além das vendas, o brechó doa roupas para pessoas
                        atendidas pela cozinha. Nos dias de brechó, nossa
                        feirinha também recebe quem quer expor e vender suas
                        produções, sem custo.
                      </p>
                      <a
                        className="text-link"
                        href={contact(
                          "Olá, vim pelo site e gostaria de saber mais sobre o Brechó Solidário e a feirinha.",
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Vamos conversar sobre o brechó{" "}
                        <ArrowUpRight size={17} />
                      </a>
                    </div>
                  </details>
                </div>
              </article>
            </div>
            <div className="fair-note">
              <span className="fair-icon">
                <ShoppingBag size={23} />
              </span>
              <div>
                <strong>Tem espaço para o que você faz.</strong>
                <p>
                  Nossa feirinha acolhe produtores locais para expor e vender
                  sem custo, nos dias de brechó.
                </p>
              </div>
              <a
                className="text-link"
                href={contact(
                  "Olá, vim pelo site e quero participar da feirinha com minhas produções.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Quero participar <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <section id="ajudar" className="section help container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SEMPRE EXISTE UM JEITO</p>
              <h2>
                O que você compartilha
                <br />
                <em>faz a diferença.</em>
              </h2>
            </div>
            <p>
              Seu tempo, uma doação, sua presença.
              <br />
              Toda forma de cuidado é bem-vinda.
            </p>
          </div>
          <div className="help-grid">
            {[
              {
                icon: HandHeart,
                title: "Doe seu tempo",
                text: "Traga suas habilidades e sua vontade de ajudar. Há lugar para você nessa rede.",
                link: "Quero ser voluntário",
                message: "Olá, vim pelo site e quero ser voluntário(a).",
                color: "pink",
              },
              {
                icon: Sprout,
                title: "Compartilhe alimentos",
                text: "Ajude a colocar mais cuidado à mesa. Fale com a gente sobre o que a cozinha precisa.",
                link: "Quero doar alimentos",
                message:
                  "Olá, vim pelo site e quero doar alimentos para a cozinha.",
                color: "yellow",
              },
              {
                icon: Shirt,
                title: "Renove histórias",
                text: "Aquela roupa em bom estado pode aquecer alguém e fortalecer nossos projetos.",
                link: "Quero doar roupas",
                message:
                  "Olá, vim pelo site e quero doar roupas para o brechó.",
                color: "green",
              },
            ].map((item) => (
              <article className="help-card" key={item.title}>
                <span className={`help-icon ${item.color}`}>
                  <item.icon size={27} strokeWidth={1.5} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <a
                  href={contact(item.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.link}
                  <ArrowUpRight size={18} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="contribua" className="contribution-section">
          <div className="container contribution-grid">
            <div className="contribution-copy">
              <p className="eyebrow">UM GESTO SEU. UM BEM PARA MUITOS.</p>
              <h2>
                A solidariedade
                <br />
                precisa de <em>continuidade.</em>
              </h2>
              <p>
                Sua contribuição ajuda a manter a cozinha acesa, o brechó em
                movimento e as portas abertas para quem precisa.
              </p>
              <TogetherArt />
              <div className="contribution-footnote">
                <Heart size={18} />
                <span>Quando a gente soma, o cuidado se multiplica.</span>
              </div>
            </div>
            <div className="donation-card">
              <span className="small-label">FAÇA PARTE DESSA REDE</span>
              <h3>
                Quanto amor cabe
                <br />
                em um gesto?
              </h3>
              <p>Escolha como você quer contribuir.</p>
              <div
                className="frequency-switch"
                role="group"
                aria-label="Frequência da contribuição"
              >
                <button
                  type="button"
                  aria-pressed={frequency === "monthly"}
                  className={frequency === "monthly" ? "selected" : ""}
                  onClick={() => changeFrequency("monthly")}
                >
                  <Heart size={15} /> Mensalmente
                </button>
                <button
                  type="button"
                  aria-pressed={frequency === "once"}
                  className={frequency === "once" ? "selected" : ""}
                  onClick={() => changeFrequency("once")}
                >
                  Uma única vez
                </button>
              </div>
              <p className="donation-label">
                {frequency === "monthly"
                  ? "Sua contribuição recorrente"
                  : "Sua contribuição única"}
              </p>
              <div
                className="amount-options"
                role="group"
                aria-label="Valor da contribuição"
              >
                {(frequency === "monthly"
                  ? VALORES_RECORRENTES.map((v) => v.centavos)
                  : SUGESTOES_UNICA_CENTAVOS
                ).map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={!customSelected && amount === value}
                    className={
                      !customSelected && amount === value ? "selected" : ""
                    }
                    onClick={() => {
                      setAmount(value);
                      setCustomSelected(false);
                      setAmountError("");
                    }}
                  >
                    {money(value)}
                    {frequency === "monthly" && <small>/ mês</small>}
                    {!customSelected && amount === value && (
                      <span className="amount-check">
                        <Check size={10} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {frequency === "once" && (
                <div className="custom-amount">
                  <button
                    type="button"
                    className="custom-amount-toggle"
                    aria-pressed={customSelected}
                    onClick={() => setCustomSelected(!customSelected)}
                  >
                    Prefiro escolher outro valor <ChevronDown size={15} />
                  </button>
                  {customSelected && (
                    <label>
                      Valor da contribuição (R$)
                      <input
                        autoFocus
                        inputMode="numeric"
                        value={custom}
                        placeholder="Ex.: 75,00"
                        onChange={(event) =>
                          setCustom(mascararMoeda(event.target.value))
                        }
                        aria-describedby={
                          amountError ? "amount-error" : undefined
                        }
                        aria-invalid={!!amountError}
                      />
                    </label>
                  )}
                </div>
              )}
              <div className="donation-context">
                <Sprout size={20} />
                <p>
                  {frequency === "monthly"
                    ? "Um apoio que se renova para que o cuidado também continue."
                    : "Cada gesto soma forças à nossa rede de cuidado."}
                </p>
              </div>
              {amountError && (
                <p className="form-error" id="amount-error" role="alert">
                  {amountError}
                </p>
              )}
              <button
                className="button button-green donation-submit"
                type="button"
                onClick={openCheckout}
              >
                Quero fazer a diferença <ArrowRight size={18} />
              </button>
              <p className="donation-demo">
                <ShieldCheck size={14} /> Pix ou cartão, com pagamento
                seguro pelo Asaas.
              </p>
              <div className="donation-contact">
                Prefere ajudar de outra forma?{" "}
                <a
                  href={contact(
                    "Olá, vim pelo site e gostaria de conversar sobre uma contribuição.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fale com a gente <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="partners container">
          <p>UMA REDE QUE SE CONSTRÓI JUNTO</p>
          <div>
            <span className="partner-mtd">
              MTD
              <span>
                Movimento de Trabalhadoras
                <br />e Trabalhadores por Direitos
              </span>
            </span>
            <span className="partner-association">
              Associação
              <br />
              <strong>Carlos Dorneles</strong>
            </span>
            <span className="partner-camp">
              CAMP<span>Parceria e transformação social</span>
            </span>
          </div>
        </section>

        <section className="faq-section section container">
          <div>
            <p className="eyebrow">VAMOS CONVERSAR?</p>
            <h2>
              O cuidado começa
              <br />
              <em>com uma resposta.</em>
            </h2>
            <p>
              Ficou com alguma dúvida?
              <br />A Natália pode ajudar você.
            </p>
            <a
              className="text-link"
              href={contact(
                "Olá, vim pelo site e fiquei com uma dúvida sobre os projetos.",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={17} /> Conversar pelo WhatsApp{" "}
              <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <div
                className={`faq-item ${faq === index ? "open" : ""}`}
                key={question}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={faq === index}
                    aria-controls={`faq-${index}`}
                    onClick={() => setFaq(faq === index ? null : index)}
                  >
                    {question}
                    {faq === index ? <Minus size={19} /> : <Plus size={19} />}
                  </button>
                </h3>
                <div id={`faq-${index}`} hidden={faq !== index}>
                  <p>{answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contato" className="contact-section container">
          <div className="contact-card">
            <div className="contact-doodle" aria-hidden="true">
              <Heart size={55} strokeWidth={1.2} />
              <span>chega mais!</span>
            </div>
            <div>
              <p className="eyebrow">AS PORTAS ESTÃO ABERTAS</p>
              <h2>
                Essa história também
                <br />
                pode ser <em>sua.</em>
              </h2>
              <p>
                Rua José do Patrocínio, 570 · Cidade Baixa
                <br />
                Porto Alegre, RS
              </p>
              <a
                className="map-link"
                href="https://www.google.com/maps/search/?api=1&query=Rua+Jos%C3%A9+do+Patroc%C3%ADnio+570+Porto+Alegre"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver como chegar <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="contact-action">
              <a
                className="button button-green"
                href={contact(
                  "Olá, Natália! Vim pelo site e quero conhecer os projetos do Redentor Meridional.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={19} /> Vamos conversar
              </a>
              <span>
                Fale com a Natália
                <br />
                <strong>(51) 99110-0476</strong>
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-top">
          <a href="#" className="brand footer-brand">
            <Image src="/logo.png" width={52} height={47} alt="" />
            <span>
              redentor<span>meridional.</span>
            </span>
          </a>
          <p>
            Solidariedade que aproxima.
            <br />
            Cuidado que transforma.
          </p>
          <a
            href="https://www.facebook.com/redentor.meridional"
            target="_blank"
            rel="noopener noreferrer"
          >
            Acompanhe no Facebook <ExternalLink size={14} />
          </a>
          <a href="#" className="back-top">
            Voltar ao topo <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Redentor Meridional. Feito de gente,
            para gente.
          </span>
          <a href="/privacidade">Privacidade</a>
          <span className="footer-love">
            Com carinho, na Cidade Baixa <Heart size={12} />
          </span>
        </div>
      </footer>

      {pedido && (
        <Checkout pedido={pedido} onClose={() => setPedido(null)} />
      )}
    </>
  );
}
