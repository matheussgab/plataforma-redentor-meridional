# STATUS — Redentor Meridional

## Estado atual (04/10/2026)

Projeto alinhado a `docs/ARQUITETURA-PAGAMENTOS.txt` (Asaas + Supabase, split para o MA24). Testado **só em modo demonstração** (sem `.env.local`): build, tipos, rotas da API e `scripts/verify.mjs` (13 checagens no Chrome em 320, 390, 768 e 1440 px).

**Pronto no código:**

- Checkout real em três passos (`components/Checkout.tsx`): Pix ou cartão, também na recorrente, com aviso de que o Pix mensal não é automático. CPF validado e obrigatório. Caixa de consentimento obrigatória, conferida também no servidor. Mínimo de R$ 5 na contribuição única.
- `POST /api/contribuicao`: zod, valor decidido no servidor, split, gravação `pendente`, desfaz a cobrança no Asaas se o banco falhar.
- `GET /api/contribuicao/status` (tela do Pix) e `POST /api/asaas/webhook`: token em tempo constante, idempotente, `PAYMENT_*` e `SUBSCRIPTION_DELETED/INACTIVATED`.
- Painel `/admin` com login (`/admin/entrar`, usuário → `usuario@redentor.ma24.com.br`), autorização por `redentor_staff`, histórico, recorrentes ativas e encerradas, botão "Encerrar", total do mês, líquido depois de tarifas e repasse, CSV (com proteção contra fórmula).
- `/privacidade` com controlador, dados, base legal, compartilhamento, retenção, direitos e versão. Mostra "a confirmar" onde faltam razão social e CNPJ.
- Migração `supabase/migrations/0001_redentor.sql` (já com as colunas de consentimento e sem CPF). `vercel.json` com o cron da `/api/saude`. `.env.example`.

**Supabase conectado (04/10):** projeto próprio, migração 0001 aplicada, RLS conferida (anônimo não lê nem grava `redentor_contribuintes`/`redentor_contribuicoes`; teste inserido e apagado), usuário do painel `natalia` (`natalia@redentor.ma24.com.br`) criado e cadastrado em `redentor_staff`, login testado no `/admin`. `/api/saude` responde `banco: "ativo"`. Com o Asaas sem chave, o checkout continua em demo e não grava no banco.

**Ainda não existe:** conta Asaas (sandbox e produção), deploy na Vercel, cadastro do webhook.

## Próximos passos (seção 11 do documento)

1. Pierre: confirmar percentual do MA24 (código assume 10%) e o texto de transparência do checkout.
2. ~~Supabase: projeto, migração, RLS, usuário do painel~~ (feito em 04/10).
3. Asaas sandbox: chave **sem expiração**, cadastrar chave Pix, testar recorrente no cartão, recorrente no Pix e única.
4. Vercel: publicar com as variáveis, cadastrar o webhook (URL + token, eventos `PAYMENT_*` e `SUBSCRIPTION_*`) e ver uma contribuição virar "pago" sozinha.
5. Asaas produção na conta **da organização** (PF ou PJ a decidir) + Wallet ID do MA24; teste com o menor valor conferindo o split.
6. Checklist da seção 12 antes de divulgar.

## A conferir

- Nomes exatos dos eventos `SUBSCRIPTION_*` na doc do Asaas (o webhook trata `SUBSCRIPTION_DELETED` e `SUBSCRIPTION_INACTIVATED`).
- Domínio interno do login (`redentor.ma24.com.br`): confirmar que não recebe e-mail, como o do terreiro.
- Pendências com o cliente: ver `CLAUDE.md`.
