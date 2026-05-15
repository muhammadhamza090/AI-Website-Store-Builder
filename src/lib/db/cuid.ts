/**
 * Lightweight cuid-like ID generator.
 * Produces IDs compatible with the old Prisma @default(cuid()) format.
 * No external dependency needed.
 */

const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";
let counter = 0;

function pad(num: number, size: number) {
  const s = num.toString(36);
  return s.length >= size ? s : "0".repeat(size - s.length) + s;
}

function fingerprint() {
  const padding = 2;
  const pid = typeof process !== "undefined" ? process.pid : 0;
  const hostname =
    typeof process !== "undefined" && process.env?.HOSTNAME
      ? process.env.HOSTNAME
      : "localhost";
  const hostId = hostname.split("").reduce((prev, char) => prev + char.charCodeAt(0), 0);
  return pad(pid, padding) + pad(hostId, padding);
}

function randomBlock() {
  let str = "";
  for (let i = 0; i < 4; i++) {
    str += BASE36[Math.floor(Math.random() * 36)];
  }
  return str;
}

export function createId(): string {
  const ts = pad(Date.now(), 8);
  const c = pad(counter++, 4);
  const fp = fingerprint();
  return "c" + ts + c + fp + randomBlock() + randomBlock();
}
