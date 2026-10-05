# Plataforma Redentor Meridional

Site com doações online para uma **organização social** que funciona no espaço da Paróquia do Redentor (IEAB – Diocese Meridional), na Cidade Baixa, em Porto Alegre. Os projetos em destaque são a **Cozinha Solidária** e o **Brechó Solidário**.

> Status (04/10/2026): **site + checkout + painel alinhados a [docs/ARQUITETURA-PAGAMENTOS.txt](docs/ARQUITETURA-PAGAMENTOS.txt)** (Asaas + Supabase, com split para o MA24). Roda em modo demonstração sem variáveis de ambiente; ainda sem Supabase, sem conta Asaas e sem deploy. Andamento detalhado em [STATUS.md](STATUS.md), instruções em [README.md](README.md), notas originais do cliente em [contexto.txt](contexto.txt).

## Regras importantes (não quebrar)

- **Nunca usar "assinatura" nem "assinatura mensal".** O termo é sempre **"contribuição recorrente"**, que tem mais a pegada de paróquia. Isso vale para o texto do site, o código visível, o painel e os e-mails.
- **O site NÃO é da igreja.** É de uma organização de fora que usa o espaço da igreja. A protagonista é a organização, e a igreja aparece só como o espaço que acolhe ("funcionamos no espaço da Paróquia do Redentor").
- **Não citar o clero.** Nada de Revdo. Paulo Duarte, Revda. Helena Gastal etc.
- **Não divulgar horários.** Eles não têm horário fixo e não querem divulgar. Todo pedido de informação vai para o WhatsApp.
- **Não citar número exato de marmitas.** Usar "centenas de marmitas por semana". Eles participam de vários projetos, então não existe número fixo ou médio.
- **Não linkar Instagram.** Perderam a senha das duas contas e nenhuma está em uso.
- **Não usar fotos geradas por IA** fingindo ser o lugar real, porque é um site que pede doação.
- **Não mostrar o rosto de pessoas atendidas.** A foto do post do Instagram mostra um atendido e não deve ser usada.

## Dados de contato (usar no site)

| Item | Valor |
|---|---|
| Endereço | Rua José **do** Patrocínio, 570 – Cidade Baixa – Porto Alegre/RS (o certo é "do", não "da") |
| Telefone / WhatsApp | Natália: (51) 99110-0476 → `https://wa.me/5551991100476` |
| Facebook | https://www.facebook.com/redentor.meridional (ativo) |
| E-mail | redentormeridional.ieabdm@gmail.com (**a confirmar** se ainda é usado e se é da igreja ou da organização) |

O telefone antigo do cartão, (51) 98634-7250, **não** deve ser usado.

## Conteúdo disponível

- **Cozinha Solidária:** refeições completas no horário do almoço para pessoas em vulnerabilidade social, centenas de marmitas por semana. Depende de voluntários e de doação de alimentos. Começou em 20/03/2025 em parceria com o **MTD** (Movimento de Trabalhadoras e Trabalhadores por Direitos), a **Associação Carlos Dorneles** e o **CAMP**.
- **Brechó Solidário:** vende roupas doadas a preço popular para gerar renda para a cozinha e os demais serviços de acolhida. Também doa roupas para quem é atendido pela cozinha.
- **Feirinha:** nos dias de brechó, qualquer pessoa pode expor e vender suas produções sem custo.
- **Parceria com o MTD:** apresentado como companheiro de luta pelos direitos humanos e pela classe trabalhadora.
- **Voluntariado:** novos voluntários são sempre bem-vindos. No site, o caminho é o contato pelo WhatsApp.

### Assets (`assets/`)

| Arquivo | O que é |
|---|---|
| `logo.png` | Logo de mãos coloridas ao redor de um prédio, um sol e folhas. Fundo branco, 1,1 MB. Precisa recortar e otimizar (WebP/SVG). **A confirmar** se o logo é da organização |
| `apresentacao-cozinha-e-brecho.jpg` | Folder com os textos da Cozinha e do Brechó. Tem horários em branco e informações antigas |
| `apresentacao-espaço.jpg` | Folder com Parceria MTD, Feirinha, Momentos de oração e Sobre a Igreja. Os dois últimos são da igreja, então provavelmente ficam fora do site |
| `info.jpg` | Cartão antigo da paróquia. **Não usar** o telefone nem o clero |
| `insta-post-1.png` + `insta-post-1-legenda.txt` | Post de lançamento da Cozinha. A foto mostra o rosto de um atendido e **não deve ser usada** |

**Fotos:** quase não existem. Já foi preparada uma mensagem pedindo à Natália fotos de celular: panelas, marmitas, brechó, fachada e voluntários que concordem em aparecer, sem rosto de atendidos. Enquanto as fotos não chegam, o visual se apoia no logo (cores das mãos), em ilustração e em tipografia.

## Escopo

1. **Site público:** Início, Cozinha Solidária, Brechó Solidário (com a Feirinha), Como ajudar (voluntariado e doação de alimentos ou roupas), Contribua e Contato. Cada seção termina com um botão de WhatsApp para a Natália, com uma mensagem pronta (ex.: "Olá, vim pelo site e quero ser voluntário(a)").
2. **Contribuições:**
   - Contribuição única com valor livre (Pix ou cartão).
   - Contribuição recorrente mensal: **R$ 9,90, R$ 49,90 ou R$ 149,90**.
3. **Painel `/admin`:** com login, fora da navegação e sem indexação. Mostra contribuintes recorrentes (ativos e cancelados), histórico de contribuições, total do mês e exportação para CSV.
4. **Política de privacidade (LGPD):** em `/privacidade`, com consentimento obrigatório no checkout (conferido também no servidor). Guardamos nome, e-mail e telefone; o **CPF vai só para o Asaas e não fica no banco**.

## Stack e arquitetura

A arquitetura segue **[docs/ARQUITETURA-PAGAMENTOS.txt](docs/ARQUITETURA-PAGAMENTOS.txt)** (padrão do MA24, com referência viva no repositório `ma24-app-terreiro`). Ler esse documento antes de mexer em pagamento, banco ou painel. As regras da seção 2 dele (centavos, valor decidido no servidor, "pago" só pelo webhook, split em toda cobrança etc.) valem aqui.

- **Next.js 16** na **Vercel** (ver a memória sobre o fluxo de deploy na Vercel desse usuário). `proxy.ts`, não `middleware.ts`.
- **Supabase** para o banco e o login do painel. Tabelas com prefixo `redentor_`, RLS ligada, migração em `supabase/migrations/0001_redentor.sql`.
- **Asaas** para o pagamento (Pix e cartão, sem boleto), na conta **da organização**, com **split** de `REPASSE_PERCENTUAL` (padrão 10%, sobre o valor líquido) para a carteira do MA24. Sem a carteira, a produção recusa a cobrança (`PERMITIR_SEM_SPLIT=1` só para conta de teste).
- Variáveis em `.env.example`. Sem elas, tudo roda em **modo demonstração** e avisa na tela.

### Adaptações em relação ao documento de arquitetura

| No documento | Aqui | Por quê |
|---|---|---|
| `<p>_assinaturas`, "doação mensal" | `redentor_recorrentes`, "contribuição recorrente" | Regra do "nunca assinatura". O termo do Asaas (`subscription`) só aparece nos caminhos da API e na coluna `asaas_subscription_id` |
| `<p>_doadores`, `<p>_doacoes`, tipo `mensal/avulsa` | `redentor_contribuintes`, `redentor_contribuicoes`, tipo `recorrente/unica` | Vocabulário do site |
| `/api/doacao`, `/login`, `/painel` | `/api/contribuicao`, `/admin/entrar`, `/admin` | Escopo pede painel em `/admin` |
| Planos com nome e código | Códigos `990`, `4990`, `14990` em `lib/contribuicoes/valores.ts` | O cliente não deu nome aos níveis; não inventar |
| CPF opcional no Pix | CPF obrigatório (validado) | O Asaas exige CPF para emitir cobrança |
| Melhorias 13.1, 13.3, 13.4 e 13.5 pendentes | Já feitas: trava do split, cobrança órfã desfeita, botão "Encerrar" no painel, eventos `SUBSCRIPTION_*` no webhook | Recomendação do próprio documento |

## Pontos de atenção

- **Conta Asaas no CPF da Natália?** As contribuições contariam como renda pessoal dela. Se a organização tiver CNPJ, a conta deve ser PJ. A conta é criada por nós (e-mail do MA24), com os documentos da organização.
- **Os responsáveis são pessoas de mais idade.** Nada de jargão técnico (API, token, webhook) nas conversas com eles. A configuração do pagamento deve ser feita junto com a Natália, pessoalmente ou por chamada de vídeo, e **nunca pedindo senha**.

## Pendências com o cliente

- [ ] Nome oficial da organização. É o "Centro de Diaconia", "Redentor Meridional" ou uma das parceiras (MTD, Associação Carlos Dorneles, CAMP)?
- [ ] A organização tem CNPJ?
- [ ] O logo das mãos é da organização?
- [ ] O e-mail redentormeridional.ieabdm@gmail.com ainda é usado, e é de quem?
- [ ] Fotos (pedido enviado ou a enviar para a Natália)
- [x] Provedor de pagamento: **Asaas** (docs/ARQUITETURA-PAGAMENTOS.txt). Falta decidir se a conta será PF ou PJ
- [ ] Documentos da organização para a conta Asaas de produção
- [ ] Confirmar com o Pierre o percentual do MA24 e o texto de transparência do checkout ("Uma pequena parte de cada contribuição cobre as tarifas do pagamento e a manutenção do site")
- [ ] Revisão jurídica da `/privacidade` e termo MA24 (operador) × organização (controladora)

## Observações

- Esta pasta agora tem **Git próprio**, inicializado para isolar o código do repositório do diretório do usuário.
- Um resumo para o gestor foi enviado por chat. Existe também um doc online começado e incompleto (só o resumo foi preenchido): https://claude.ai/code/artifact/12bb6a8a-a0d2-4599-b7ea-081c02cde3ec. Ele foi escrito antes de sabermos que o site é da organização e não da igreja, e ainda fala em "assinaturas". Está desatualizado.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
