# Redentor Meridional

Site dos projetos sociais na Cidade Baixa, em Porto Alegre, com contribuição única e recorrente (Pix ou cartão) e painel interno. A arquitetura de pagamento segue [docs/ARQUITETURA-PAGAMENTOS.txt](docs/ARQUITETURA-PAGAMENTOS.txt): Asaas + Supabase, com split para o MA24.

## Executar

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin (login em `/admin/entrar`)
- Política de privacidade: http://localhost:3000/privacidade

```bash
npm run typecheck
npm run build
npm start
```

## Modo demonstração

Sem `.env.local`, o site roda inteiro com dados fictícios e **avisa na tela**:

- o checkout valida os dados e mostra um Pix de exemplo, sem falar com o Asaas e sem gravar nada;
- o painel abre direto, sem login, com contribuintes fictícios;
- `/api/saude` responde `banco: "demo"`.

Para ligar de verdade, copie `.env.example` para `.env.local` e preencha (onde pegar cada valor: seção 4 do documento de arquitetura).

## Como o dinheiro anda

1. O checkout manda para `POST /api/contribuicao` o **código** do valor recorrente (ou o valor da única), os dados e o consentimento.
2. O servidor decide o valor, cria o cliente e a cobrança no Asaas **com split** e grava a contribuição como `pendente`.
3. Pix: a tela mostra o QR e consulta `GET /api/contribuicao/status` a cada 4 s. Cartão: a pessoa vai para a página do Asaas.
4. O Asaas avisa `POST /api/asaas/webhook` e só então a contribuição vira `pago`.
5. O painel lê do Supabase (RLS + tabela `redentor_staff`) e pode encerrar uma contribuição recorrente.

## Estrutura

- `app/page.tsx`: site público.
- `components/Checkout.tsx`: checkout em três passos (forma, dados, pagamento).
- `app/api/contribuicao/`: única porta de entrada de dinheiro e consulta de status.
- `app/api/asaas/webhook/`: única fonte de "pago".
- `app/api/admin/recorrentes/[id]/cancelar/`: botão "Encerrar" do painel.
- `app/api/saude/`: batida diária (cron em `vercel.json`) para o Supabase Free não pausar.
- `app/admin/`: painel (`page.tsx` lê no servidor, `painel.tsx` mostra) e login (`entrar/`).
- `app/privacidade/`: política de privacidade (rascunho para revisão jurídica).
- `lib/config/site.ts`: único lugar com dados da organização.
- `lib/contribuicoes/valores.ts`: valores e limites, em centavos.
- `lib/asaas/cliente.ts`: chamadas ao Asaas, split e modo demo.
- `lib/supabase/`, `lib/auth/`, `proxy.ts`: sessão e autorização do painel.
- `supabase/migrations/`: tabelas `redentor_*` e RLS.
- `assets/`: material original recebido (não publicado).

## Validação automatizada

Com o servidor local em execução e o Google Chrome instalado:

```bash
node scripts/verify.mjs
```

Testa, em modo demonstração, o checkout (validações, consentimento, mínimo de R$ 5, Pix e cartão), o login e o painel (lista, filtros, CSV, botão Encerrar), larguras de 320, 390, 768 e 1440 pixels, links de contato e erros de execução. Capturas e relatório vão para `artifacts/` (fora do Git). Para testar outra URL, definir `PREVIEW_URL`.

## Antes de ir ao ar

Seguir a seção 11 (passo a passo) e a seção 12 (checklist) do documento de arquitetura. As pendências deste projeto estão em [STATUS.md](STATUS.md).

O conteúdo segue as decisões de `CLAUDE.md`: a organização é protagonista; a paróquia é apresentada como espaço de acolhida; não são publicados horários, clero, Instagram nem contagens exatas de refeições; nunca se usa "assinatura".
