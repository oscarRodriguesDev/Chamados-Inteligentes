"use client";

/**
 * Importações utilizadas para controle de autenticação, roteamento e efeitos colaterais:
 *
 * - `SessionProvider`, `useSession` (next-auth/react): 
 *    Gerencia e acessa o estado da sessão do usuário com NextAuth.
 *
 * - `useRouter`, `usePathname` (next/navigation): 
 *    Hooks do Next.js App Router para manipulação programática de rotas e obtenção do caminho atual.
 *
 * - `redirect` (next/navigation): 
 *    Função utilizada para redirecionamentos imperativos fora de hooks (não usada neste trecho, mas pode ser útil em loaders/server).
 *
 * - `useEffect` (react): 
 *    Hook do React para executar efeitos colaterais (ex: redirecionamentos baseados em mudanças de estado).
 */

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname, redirect } from "next/navigation";
import { useEffect } from "react";


/**
 * Provedor de autenticação para a aplicação.
 *
 * Este componente encapsula a árvore de componentes com `SessionProvider` do NextAuth
 * para fornecer o contexto de autenticação, e utiliza o `AuthGuard` para proteger rotas
 * com base no status da sessão do usuário.
 *
 * Deve envolver toda a aplicação ou as partes que requerem controle de acesso autenticado.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Elementos filhos que terão acesso ao contexto de sessão e proteção de rotas.
 * @returns {JSX.Element} Elemento JSX com o provedor de sessão e o guardião de autenticação.
 */

export default function AuthProvider({ children }: { children: React.ReactNode }) {





  return (
    <SessionProvider>
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
}

/**
 * Componente de proteção de rotas baseado no status de autenticação do usuário.
 *
 * Este componente utiliza `useSession` para verificar se o usuário está autenticado
 * e redireciona conforme o status e a rota atual:
 *
 * - Se o status for "loading", exibe um carregamento.
 * - Se o usuário **não estiver autenticado** e tentar acessar uma **rota privada**, 
 *   ele será redirecionado para `/login`.
 * - Se o usuário **estiver autenticado** e tentar acessar uma **rota pública** 
 *   (`/`, `/login`, `/register`), ele será redirecionado para `/common-page`.
 * - Caso contrário, renderiza normalmente os `children`.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Elementos filhos a serem renderizados se o acesso for permitido.
 * @returns {JSX.Element} Elemento JSX que renderiza os filhos ou redireciona o usuário.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const publicRoutes = ["/", "/login", "/recupera", "/pre-cadastro","/publiccall","/amnp"];
  const dynamicPublicPrefixes = ["/publiccall/"];


  /**
   * Efeito que gerencia a navegação com base no status da sessão e na rota atual.
   *
   * - Quando o status da sessão está como `"loading"`, o efeito não executa nenhuma ação.
   *
   * - Define um conjunto de rotas públicas: `"/"`, `"/login"` e `"/register"`.
   *
   * - Se o usuário **não estiver autenticado** (`"unauthenticated"`) e tentar acessar uma **rota protegida**,
   *   é redirecionado para `"/login"`.
   *
   * - Se o usuário **estiver autenticado** (`"authenticated"`) e estiver em uma **rota pública**,
   *   é redirecionado para `"/common-page"`, evitando que acesse páginas de login/registro enquanto logado.
   *
   * Dependências: `status`, `router`, `pathname`.
   */
  useEffect(() => {
    if (status === "loading") return;

    const isPublicPage =
    publicRoutes.includes(pathname || "") ||
    dynamicPublicPrefixes.some(prefix => pathname?.startsWith(prefix));

    if (status === "unauthenticated" && !isPublicPage) {
      router.push("/");
      return;
    }

    if (status === "authenticated" && isPublicPage) {
      //router.push("/"); //pegar o id do usuario
      //return;
    }
  }, [status, router, pathname]);


  if (status === "loading") {
    return <></>
  }

  return <>{children}</>;
}
