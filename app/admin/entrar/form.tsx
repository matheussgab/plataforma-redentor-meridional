"use client";

import { useActionState } from "react";
import { ArrowUpRight } from "lucide-react";
import { entrar, type EstadoLogin } from "./actions";

export function FormularioLogin() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={acao} className="login-form">
      <label className="checkout-field">
        Usuário
        <input autoCapitalize="none" autoComplete="username" name="usuario" required spellCheck={false} />
      </label>
      <label className="checkout-field">
        Senha
        <input autoComplete="current-password" name="senha" required type="password" />
      </label>
      {estado.erro && (
        <p className="form-error" role="alert">
          {estado.erro}
        </p>
      )}
      <button className="button button-green" disabled={enviando} type="submit">
        {enviando ? "Entrando…" : "Entrar"} <ArrowUpRight size={18} />
      </button>
    </form>
  );
}
