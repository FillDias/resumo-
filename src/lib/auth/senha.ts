import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (senha: string, sal: Buffer, tamanho: number) => Promise<Buffer>;

const TAMANHO_DA_CHAVE = 64;

export async function gerarHashDaSenha(senha: string) {
  const sal = randomBytes(16);
  const chave = await scryptAsync(senha, sal, TAMANHO_DA_CHAVE);
  return `${sal.toString("hex")}:${chave.toString("hex")}`;
}

export async function senhaConfere(senha: string, hash: string) {
  const [salEmHex, chaveEmHex] = hash.split(":");
  const chave = await scryptAsync(senha, Buffer.from(salEmHex, "hex"), TAMANHO_DA_CHAVE);
  return timingSafeEqual(chave, Buffer.from(chaveEmHex, "hex"));
}
