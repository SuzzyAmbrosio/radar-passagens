import { prisma } from "@/lib/prisma";
/** Temporary server-side identity until the authentication adapter is connected. */
export async function getCurrentUser() {
  return prisma.user.upsert({ where: { email: "dev@radardepassagens.local" }, update: {}, create: { email: "dev@radardepassagens.local", name: "Usuário de desenvolvimento" } });
}
