import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";

function randomCode(length = 4) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createCaptchaSvg(code: string) {
  const lines = Array.from({ length: 5 }, () => {
    const x1 = randomInt(0, 160);
    const y1 = randomInt(0, 54);
    const x2 = randomInt(0, 160);
    const y2 = randomInt(0, 54);
    const color = `rgba(${randomInt(90, 200)}, ${randomInt(100, 210)}, ${randomInt(130, 230)}, 0.55)`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.2" />`;
  }).join("");

  const chars = code
    .split("")
    .map((char, index) => {
      const x = 24 + index * 30 + randomInt(-2, 2);
      const y = 36 + randomInt(-4, 4);
      const rotate = randomInt(-18, 18);
      return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})" font-size="28" fill="#173a6f" font-family="Arial, sans-serif" font-weight="700">${char}</text>`;
    })
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="54" viewBox="0 0 160 54">
  <rect x="0" y="0" width="160" height="54" rx="10" fill="#ecf4ff" />
  ${lines}
  ${chars}
</svg>`;
}

export async function createCaptcha(scene: string) {
  const code = randomCode(4);
  const id = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.captcha.create({
    data: {
      id,
      scene,
      code,
      expiresAt
    }
  });

  prisma.captcha
    .deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    .catch(() => null);

  return {
    id,
    svg: createCaptchaSvg(code)
  };
}

export async function verifyCaptcha(input: {
  scene: string;
  captchaId: string;
  captchaCode: string;
}) {
  const found = await prisma.captcha.findUnique({
    where: { id: input.captchaId }
  });

  if (!found) {
    return false;
  }

  if (found.scene !== input.scene) {
    return false;
  }

  if (found.expiresAt.getTime() < Date.now()) {
    return false;
  }

  const ok = found.code.toUpperCase() === input.captchaCode.trim().toUpperCase();
  if (!ok) {
    return false;
  }

  await prisma.captcha.delete({ where: { id: found.id } }).catch(() => null);
  return true;
}