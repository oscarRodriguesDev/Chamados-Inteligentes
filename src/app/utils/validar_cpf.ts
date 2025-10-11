// Função simples para validar CPF (apenas números e 11 dígitos)
// Validação real de CPF (com cálculo dos dígitos verificadores) e depois verifica se está na lista
 export function isValidCPF(cpf: string, lista_cpf: string[]): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11) return false;
  // Elimina CPFs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  if(!lista_cpf.includes(cpf)){
  throw new Error("CPF não está na lista de CPFs autorizados.");
  } ;
  // Verifica se está na lista de CPFs autorizados
  return lista_cpf.includes(cpf);
}