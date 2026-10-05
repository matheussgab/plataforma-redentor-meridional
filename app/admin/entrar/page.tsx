import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { FormularioLogin } from "./form";

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="admin-entry">
      <Link href="/" className="text-link">
        <ArrowLeft size={17} /> Voltar ao site
      </Link>
      <div className="admin-welcome">
        <Image src="/logo.png" width={96} height={84} alt="Redentor Meridional" />
        <p className="eyebrow">CUIDAR TAMBÉM É ORGANIZAR</p>
        <h1>
          Um olhar sobre
          <br />a nossa rede.
        </h1>
        <p>Entre com o usuário e a senha que você recebeu.</p>
        {erro === "sem_acesso" && (
          <div className="admin-demo-note">
            <Info size={19} />
            <span>Esta conta não tem acesso ao painel.</span>
          </div>
        )}
        <FormularioLogin />
      </div>
      <span className="entry-foot">Redentor Meridional · Painel</span>
    </main>
  );
}
