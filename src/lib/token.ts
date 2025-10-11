import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';
const encoder = new TextEncoder();

export async function gerarToken(payload: JWTPayload, expiresIn: string = '1h'): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encoder.encode(JWT_SECRET));
}

export async function verificarToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));
    return payload;
  } catch (err) {
    return null;
  }
}
