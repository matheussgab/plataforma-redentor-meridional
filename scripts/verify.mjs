import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

// Browser-based smoke checks in demo mode; no external messages or payments.
const base = process.env.PREVIEW_URL || "http://localhost:3000";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const results = [];
async function check(name, run) {
  await run();
  results.push(name);
  console.log(`PASS ${name}`);
}
async function noOverflow() {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    "Page overflows horizontally",
  );
}
const text = async (locator) =>
  (await locator.textContent()).replaceAll(" ", " ");
async function fillDetails(dialog, { cpf = "529.982.247-25" } = {}) {
  await dialog.getByLabel("Nome completo").fill("Pessoa Teste");
  await dialog.getByLabel("E-mail").fill("teste@example.com");
  await dialog.getByLabel("CPF").fill(cpf);
  await dialog.getByRole("checkbox").check();
}
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await check("Desktop layout fits viewport", noOverflow);
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
  await page.screenshot({ path: "artifacts/hero-desktop.png" });
  await check("Project information expands", async () => {
    await page.getByText("Conheça a cozinha", { exact: true }).click();
    assert(
      await page
        .getByRole("link", { name: "Quero ajudar a cozinha" })
        .isVisible(),
    );
  });
  await check(
    "Recurring Pix checkout validates data, requires consent and shows demo Pix",
    async () => {
      await page.getByRole("button", { name: "R$ 149,90 / mês" }).click();
      await page
        .getByRole("button", { name: "Quero fazer a diferença" })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      assert((await text(dialog)).includes("R$ 149,90"));
      await dialog.getByRole("button", { name: "Pix", exact: true }).click();
      assert(
        (await text(dialog)).includes("No Pix, a cobrança não é automática"),
      );
      await page.screenshot({ path: "artifacts/checkout-forma.png" });
      await dialog.getByRole("button", { name: "Continuar" }).click();
      await dialog.getByRole("button", { name: "Gerar Pix" }).click();
      assert(await dialog.getByText("Informe seu nome.").isVisible());
      await fillDetails(dialog, { cpf: "123.456.789-00" });
      await dialog.getByRole("button", { name: "Gerar Pix" }).click();
      assert(await dialog.getByText(/Confira o CPF/).isVisible());
      await dialog.getByLabel("CPF").fill("529.982.247-25");
      await dialog.getByRole("checkbox").uncheck();
      await dialog.getByRole("button", { name: "Gerar Pix" }).click();
      assert(
        await dialog.getByText(/aceite a Política de Privacidade/).isVisible(),
      );
      await page.screenshot({ path: "artifacts/checkout-dados.png" });
      await dialog.getByRole("checkbox").check();
      await dialog.getByRole("button", { name: "Gerar Pix" }).click();
      await dialog.getByRole("heading", { name: "Pague com Pix" }).waitFor();
      assert((await text(dialog)).includes("Modo demonstração"));
      assert(
        await dialog.getByRole("button", { name: "Copiar código" }).isVisible(),
      );
      await page.screenshot({ path: "artifacts/checkout-pix.png" });
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
    },
  );
  await check(
    "Custom one-time amount enforces the R$ 5 minimum and card goes to Asaas page",
    async () => {
      await page
        .getByRole("button", { name: "Uma única vez", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Prefiro escolher outro valor" })
        .click();
      const custom = page.getByLabel("Valor da contribuição (R$)");
      await custom.fill("400");
      await page
        .getByRole("button", { name: "Quero fazer a diferença" })
        .click();
      assert(
        await page
          .getByText("Informe um valor entre R$ 5,00 e R$ 10.000,00.")
          .isVisible(),
      );
      await custom.fill("7550");
      assert.equal(await custom.inputValue(), "75,50");
      await page
        .getByRole("button", { name: "Quero fazer a diferença" })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      assert((await text(dialog)).includes("R$ 75,50"));
      assert.equal(
        await dialog
          .getByRole("button", { name: "Pix", exact: true })
          .getAttribute("aria-pressed"),
        "true",
      );
      await dialog.getByRole("button", { name: "Cartão", exact: true }).click();
      await dialog.getByRole("button", { name: "Continuar" }).click();
      await fillDetails(dialog);
      await dialog.getByRole("button", { name: "Ir para o pagamento" }).click();
      await dialog.getByRole("heading", { name: "Falta pouco" }).waitFor();
      assert(
        await dialog
          .getByRole("button", { name: /indisponível na demonstração/ })
          .isDisabled(),
      );
      await page.keyboard.press("Escape");
    },
  );
  await check(
    "Contact links use the approved number; section links have valid targets",
    async () => {
      const hrefs = await page
        .locator("a[href]")
        .evaluateAll((elements) =>
          elements.map((el) => el.getAttribute("href")),
        );
      for (const href of hrefs.filter((href) =>
        href.startsWith("https://wa.me/"),
      ))
        assert(href.startsWith("https://wa.me/5551991100476?text="));
      for (const href of hrefs.filter(
        (href) => href.startsWith("#") && href.length > 1,
      ))
        assert(await page.locator(href).count(), `Missing anchor ${href}`);
      assert(!hrefs.some((href) => href.includes("instagram.com")));
    },
  );
  await check("Checkout fits a 390px phone", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page
      .getByRole("button", { name: "Quero fazer a diferença" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Continuar" })
      .click();
    await noOverflow();
    await page.screenshot({ path: "artifacts/checkout-mobile.png" });
    await page.keyboard.press("Escape");
  });
  await check("Mobile navigation and layout work at 390px", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base, { waitUntil: "networkidle" });
    await noOverflow();
    await page.screenshot({
      path: "artifacts/home-mobile.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page
      .getByRole("navigation", { name: "Navegação mobile" })
      .getByRole("link", { name: "Como ajudar" })
      .click();
    assert.equal(
      await page.getByRole("navigation", { name: "Navegação mobile" }).count(),
      0,
    );
    assert(page.url().endsWith("#ajudar"));
  });
  await check("Layout also fits 320px and tablet", async () => {
    for (const width of [320, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await noOverflow();
      await page.screenshot({
        path: `artifacts/home-${width}.png`,
        fullPage: true,
      });
    }
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  // Com o banco ligado, o painel exige login real: testa só a recusa.
  const saude = await (await fetch(`${base}/api/saude`)).json();
  const demo = saude.banco === "demo";
  await check(
    demo ? "Admin login explains demo mode" : "Admin requires login and rejects a wrong password",
    async () => {
      if (!demo) {
        await page.goto(`${base}/admin`, { waitUntil: "networkidle" });
        assert(new URL(page.url()).pathname === "/admin/entrar");
      } else {
        await page.goto(`${base}/admin/entrar`, { waitUntil: "networkidle" });
      }
      await page.getByLabel("Usuário").fill("natalia");
      await page.getByLabel("Senha").fill("senha-errada-de-teste");
      await page.getByRole("button", { name: "Entrar" }).click();
      await page
        .locator("p.form-error")
        .getByText(demo ? /Modo demonstração: o login precisa/ : "Usuário ou senha incorretos.")
        .waitFor();
      await page.screenshot({ path: "artifacts/admin-login.png" });
    },
  );
  if (demo) await page.goto(`${base}/admin`, { waitUntil: "networkidle" });
  if (demo) await check(
    "Admin demo, recurring list, search, empty state, CSV and end button work",
    async () => {
      assert.equal(await page.locator("tbody tr").count(), 6);
      assert(
        await page.getByText(/Modo demonstração: sem o banco/).isVisible(),
      );
      await noOverflow();
      await page.screenshot({
        path: "artifacts/admin-desktop.png",
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "Contribuições recorrentes", exact: true })
        .click();
      assert.equal(await page.locator("tbody tr").count(), 4);
      await page.getByRole("button", { name: "Encerrar" }).first().click();
      assert(await page.getByText(/nada é encerrado de verdade/).isVisible());
      await page.getByRole("combobox").selectOption("cancelada");
      assert.equal(await page.locator("tbody tr").count(), 1);
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Exportar CSV" }).click();
      const download = await downloadPromise;
      assert.equal(
        download.suggestedFilename(),
        "contribuicoes-recorrentes.csv",
      );
      await download.saveAs("artifacts/contribuicoes-recorrentes.csv");
      await page
        .getByRole("textbox", { name: "Buscar contribuinte" })
        .fill("zzzzz");
      assert(await page.getByText("Nenhum registro encontrado.").isVisible());
      await page.getByRole("button", { name: "Limpar filtros" }).click();
      assert.equal(await page.locator("tbody tr").count(), 4);
      await page
        .getByRole("button", { name: "Visão geral", exact: true })
        .click();
    },
  );
  if (demo) await check(
    "Admin fits mobile with horizontally scrollable table",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await noOverflow();
      await page.screenshot({
        path: "artifacts/admin-mobile.png",
        fullPage: true,
      });
    },
  );
  await check("Privacy page is accessible and does not overflow", async () => {
    await page.goto(`${base}/privacidade`, { waitUntil: "networkidle" });
    assert(
      await page
        .getByRole("heading", { name: "Política de privacidade", exact: true })
        .isVisible(),
    );
    await noOverflow();
  });
  await check("No browser runtime errors", async () =>
    assert.deepEqual(errors, []),
  );
  await writeFile(
    "artifacts/verification.json",
    JSON.stringify({ passed: results, errors }, null, 2),
  );
} finally {
  await browser.close();
}
