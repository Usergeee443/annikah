import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const PRISMA_TELEGRAM_HELP =
  "Prisma Client yangilanmagan: loyiha ildizida `npx prisma generate` va `npx prisma db push` ni bajaring, so‘ng dev serverni to‘liq to‘xtatib (`Ctrl+C`) qayta `npm run dev` qiling.";

function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
  });
}

function hasTelegramDelegates(client: PrismaClient) {
  const c = client as unknown as {
    telegramRegisterSession?: { create?: unknown };
    telegramLoginCode?: { create?: unknown };
  };
  return (
    typeof c.telegramRegisterSession?.create === "function" &&
    typeof c.telegramLoginCode?.create === "function"
  );
}

/**
 * Eski `global.__prisma` ba’zan yangi sxemadan keyin Telegram delegate-larsiz qoladi (Next dev HMR).
 * Har `db.*` chaqiruvida tekshiramiz; kerak bo‘lsa yangi client yaratiladi.
 */
function obtainClient(): PrismaClient {
  const cached = global.__prisma;
  if (cached && hasTelegramDelegates(cached)) return cached;

  if (cached) void cached.$disconnect().catch(() => {});

  const fresh = createPrismaClient();
  if (!hasTelegramDelegates(fresh)) {
    void fresh.$disconnect().catch(() => {});
    global.__prisma = undefined;
    throw new Error(PRISMA_TELEGRAM_HELP);
  }

  global.__prisma = fresh;
  return fresh;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = obtainClient();
    return Reflect.get(client, prop, client);
  },
});
