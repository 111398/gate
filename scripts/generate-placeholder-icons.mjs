// Плейсхолдер-иконки для manifest.json (акцентный цвет из design tokens, буква G).
// Без реального дизайна — заменить на итоговый бренд-ассет перед публикацией/TWA-упаковкой.
// Запуск: node scripts/generate-placeholder-icons.mjs

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ACCENT = [0x2f, 0x80, 0xed]; // --color-accent
const WHITE = [0xff, 0xff, 0xff];

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Простая заливка с закруглённым квадратом и буквой "G" на глаз (грубый растровый шрифт),
// без внешних зависимостей — только встроенные fs/zlib.
function drawG(size) {
  const px = new Uint8Array(size * size * 3);
  const setPixel = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 3;
    px[i] = color[0];
    px[i + 1] = color[1];
    px[i + 2] = color[2];
  };

  const radius = Math.round(size * 0.18);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cornerX = x < radius ? radius : x >= size - radius ? size - radius - 1 : null;
      const cornerY = y < radius ? radius : y >= size - radius ? size - radius - 1 : null;
      let inside = true;
      if (cornerX !== null && cornerY !== null) {
        const dx = x - cornerX;
        const dy = y - cornerY;
        inside = dx * dx + dy * dy <= radius * radius;
      }
      setPixel(x, y, inside ? ACCENT : [0, 0, 0]); // фон вне скругления останется прозрачно-чёрным для alpha-версии не нужен, тут RGB — рисуем как есть
    }
  }

  // "G" грубым росчерком: кольцо-дуга + перекладина, вручную по геометрии.
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.28;
  const rInner = size * 0.19;
  const strokeAngleStart = -20; // градусы, чтобы оставить разрыв справа (как у буквы G)
  const strokeAngleEnd = 250;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > rInner && dist < rOuter) {
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (angle < 0) angle += 360;
        if (angle >= strokeAngleStart + 360 - 360 && angle <= strokeAngleEnd) {
          setPixel(x, y, WHITE);
        }
      }
    }
  }
  // Перекладина буквы G (горизонтальная чёрточка справа от центра).
  const barY0 = Math.round(cy - size * 0.03);
  const barY1 = Math.round(cy + size * 0.1);
  const barX0 = Math.round(cx + size * 0.01);
  const barX1 = Math.round(cx + rOuter);
  for (let y = barY0; y < barY1; y++) {
    for (let x = barX0; x < barX1; x++) setPixel(x, y, WHITE);
  }

  return px;
}

function encodePng(size) {
  const px = drawG(size);
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0; // filter type 0 (None)
    for (let x = 0; x < size; x++) {
      const srcI = (y * size + x) * 3;
      const dstI = y * (1 + size * 3) + 1 + x * 3;
      raw[dstI] = px[srcI];
      raw[dstI + 1] = px[srcI + 1];
      raw[dstI + 2] = px[srcI + 2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const buf = encodePng(size);
  const file = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, buf);
  console.log(`Wrote ${file} (${buf.length} bytes)`);
}
