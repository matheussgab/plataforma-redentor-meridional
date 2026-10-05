/**
 * ÚNICO arquivo com dados da organização. Identidade e contato moram aqui;
 * as páginas leem daqui. Regras de conteúdo em CLAUDE.md (sem clero, sem
 * horários, sem Instagram, telefone antigo do cartão proibido).
 */
const endereco = {
  rua: "Rua José do Patrocínio, 570",
  bairro: "Cidade Baixa",
  cidade: "Porto Alegre/RS",
};

const whatsappNumero = "5551991100476";

export const siteConfig = {
  nome: "Redentor Meridional",
  // A CONFIRMAR com o cliente: nome oficial, razão social e CNPJ. Enquanto
  // forem null, a política de privacidade mostra "a confirmar".
  razaoSocial: null as string | null,
  cnpj: null as string | null,
  // A CONFIRMAR: se o e-mail ainda é usado e se é da organização.
  email: "redentormeridional.ieabdm@gmail.com",
  endereco,
  enderecoLinha: `${endereco.rua} – ${endereco.bairro} – ${endereco.cidade}`,
  mapaUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Rua José do Patrocínio, 570 - Cidade Baixa, Porto Alegre - RS"),
  facebook: "https://www.facebook.com/redentor.meridional",
  whatsapp: {
    numero: whatsappNumero,
    exibicao: "(51) 99110-0476",
    responsavel: "Natália",
  },
  dominio: "redentor.ma24.com.br",
};

/** Link de WhatsApp para a Natália com mensagem pronta. */
export function linkWhatsapp(mensagem: string): string {
  return `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
}
