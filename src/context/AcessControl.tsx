'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useSession } from "next-auth/react";

// Tipos de cargo/setor baseado no schema.prisma e necessidades do projeto real
export type Role =
  | 'SYSTEM_ADMIN'
  | 'ADMIN_ORG'
  | 'DIRETOR'
  | 'GESTOR'
  | 'ANALISTA'
  | 'OPERADOR';

export type Setor =
  | 'RH'
  | 'DP'
  | 'TI'
  | 'SESMT'
  | 'FINANCEIRO'
  | 'COMERCIAL'
  | 'OPERACAO'
  | 'LOGISTICA';

interface AccessControlContextProps {
  role: Role | null;
  setor: Setor | null;
  hasRole: (role: Role) => boolean;
  userID: number | null;
  empresaID: number | null;
  nome: string | null;
  email: string | null;
}

const AccessControlContext = createContext<AccessControlContextProps | undefined>(undefined);

export const AccessControlProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  const [role, setRole] = useState<Role | null>(null);
  const [setor, setSetor] = useState<Setor | null>(null);
  const [userID, setUserID] = useState<number | null>(null);
  const [empresaID, setEmpresaID] = useState<number | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Estrutura esperada no token JWT do session.user:
    // { id, name, email, role, setor, empresaID }
    if (session && session.user) {
      // Suporte a next-auth adapter custom claims:
      const user: any = session.user;

      // IDs são numeric no schema
      setUserID(typeof user.id === "number" ? user.id : Number(user.id) || null);
      setEmpresaID(typeof user.empresaID === "number" ? user.empresaID : Number(user.empresaID) || null);

      setRole(user.role as Role ?? null);
      setSetor(user.setor as Setor ?? null);
      setNome(user.name ?? null);
      setEmail(user.email ?? null);
    } else {
      setRole(null);
      setSetor(null);
      setUserID(null);
      setEmpresaID(null);
      setNome(null);
      setEmail(null);
    }
  }, [session]);

  const hasRole = (required: Role) => {
    if (!role) return false;
    if (role === 'SYSTEM_ADMIN') return true; // superadmin permite tudo
    return role === required;
  };

  return (
    <AccessControlContext.Provider value={{ role, setor, hasRole, userID, empresaID, nome, email }}>
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = (): AccessControlContextProps => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error("useAccessControl must be used within an AccessControlProvider");
  }
  return context;
};
