const version = 5;
const size = 21 + (version - 1) * 4;
const dataCodewords = 108;
const eccCodewords = 26;

export function createQrSvg(value: string) {
  const matrix = createQrMatrix(value);
  const quiet = 4;
  const viewSize = size + quiet * 2;
  const cells: string[] = [];

  matrix.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) {
        cells.push(`<rect x="${x + quiet}" y="${y + quiet}" width="1" height="1"/>`);
      }
    });
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" role="img">`,
    '<rect width="100%" height="100%" fill="#fff"/>',
    `<g fill="#050507">${cells.join("")}</g>`,
    "</svg>",
  ].join("");
}

function createQrMatrix(value: string) {
  const data = encodeData(value);
  const ecc = reedSolomonRemainder(data, eccCodewords);
  const bits = bytesToBits([...data, ...ecc]);
  const base = createBaseMatrix();

  drawCodewords(base.modules, base.isFunction, bits);

  let bestMatrix: boolean[][] | null = null;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    const modules = cloneMatrix(base.modules);
    applyMask(modules, base.isFunction, mask);
    drawFormatBits(modules, mask);

    const penalty = getPenaltyScore(modules);
    if (penalty < bestPenalty) {
      bestMatrix = modules;
      bestPenalty = penalty;
    }
  }

  return bestMatrix ?? base.modules;
}

function encodeData(value: string) {
  const bytes = Array.from(new TextEncoder().encode(value));
  const bits: number[] = [];

  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const capacityBits = dataCodewords * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const data: number[] = [];
  for (let index = 0; index < bits.length; index += 8) {
    data.push(bitsToByte(bits.slice(index, index + 8)));
  }

  for (let pad = 0xec; data.length < dataCodewords; pad ^= 0xec ^ 0x11) {
    data.push(pad);
  }

  if (data.length > dataCodewords) {
    throw new Error("QR payload is too long.");
  }

  return data;
}

function createBaseMatrix() {
  const modules = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false));
  const setFunction = (x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= size || y >= size) {
      return;
    }

    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  drawFinderPattern(setFunction, 3, 3);
  drawFinderPattern(setFunction, size - 4, 3);
  drawFinderPattern(setFunction, 3, size - 4);
  drawAlignmentPattern(setFunction, 30, 30);

  for (let index = 8; index < size - 8; index += 1) {
    const dark = index % 2 === 0;
    setFunction(index, 6, dark);
    setFunction(6, index, dark);
  }

  setFunction(8, size - 8, true);
  reserveFormatAreas(setFunction);

  return { isFunction, modules };
}

function drawFinderPattern(
  setFunction: (x: number, y: number, dark: boolean) => void,
  centerX: number,
  centerY: number,
) {
  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      const dark = distance !== 2 && distance !== 4;
      setFunction(centerX + dx, centerY + dy, dark);
    }
  }
}

function drawAlignmentPattern(
  setFunction: (x: number, y: number, dark: boolean) => void,
  centerX: number,
  centerY: number,
) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunction(
        centerX + dx,
        centerY + dy,
        Math.max(Math.abs(dx), Math.abs(dy)) === 2 || (dx === 0 && dy === 0),
      );
    }
  }
}

function reserveFormatAreas(
  setFunction: (x: number, y: number, dark: boolean) => void,
) {
  for (let index = 0; index < 9; index += 1) {
    if (index !== 6) {
      setFunction(8, index, false);
      setFunction(index, 8, false);
    }
  }

  for (let index = 0; index < 8; index += 1) {
    setFunction(size - 1 - index, 8, false);
  }

  for (let index = 0; index < 7; index += 1) {
    setFunction(8, size - 1 - index, false);
  }
}

function drawCodewords(
  modules: boolean[][],
  isFunction: boolean[][],
  bits: number[],
) {
  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right -= 1;
    }

    for (let vertical = 0; vertical < size; vertical += 1) {
      const y = upward ? size - 1 - vertical : vertical;

      for (let column = 0; column < 2; column += 1) {
        const x = right - column;

        if (!isFunction[y][x] && bitIndex < bits.length) {
          modules[y][x] = bits[bitIndex] === 1;
          bitIndex += 1;
        }
      }
    }

    upward = !upward;
  }
}

function applyMask(modules: boolean[][], isFunction: boolean[][], mask: number) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!isFunction[y][x] && shouldMask(mask, x, y)) {
        modules[y][x] = !modules[y][x];
      }
    }
  }
}

function shouldMask(mask: number, x: number, y: number) {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function drawFormatBits(modules: boolean[][], mask: number) {
  const bits = getFormatBits(mask);
  const set = (x: number, y: number, index: number) => {
    modules[y][x] = ((bits >>> index) & 1) !== 0;
  };

  for (let index = 0; index <= 5; index += 1) {
    set(8, index, index);
  }

  set(8, 7, 6);
  set(8, 8, 7);
  set(7, 8, 8);

  for (let index = 9; index < 15; index += 1) {
    set(14 - index, 8, index);
  }

  for (let index = 0; index < 8; index += 1) {
    set(size - 1 - index, 8, index);
  }

  for (let index = 8; index < 15; index += 1) {
    set(8, size - 15 + index, index);
  }

  modules[size - 8][8] = true;
}

function getFormatBits(mask: number) {
  const errorCorrectionLevel = 1;
  const data = (errorCorrectionLevel << 3) | mask;
  let remainder = data << 10;

  for (let bit = 14; bit >= 10; bit -= 1) {
    if (((remainder >>> bit) & 1) !== 0) {
      remainder ^= 0x537 << (bit - 10);
    }
  }

  return ((data << 10) | remainder) ^ 0x5412;
}

function reedSolomonRemainder(data: number[], degree: number) {
  const generator = reedSolomonGenerator(degree);
  const result = Array(degree).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ (result.shift() ?? 0);
    result.push(0);

    generator.forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor);
    });
  });

  return result;
}

function reedSolomonGenerator(degree: number) {
  let result = [1];

  for (let index = 0; index < degree; index += 1) {
    const next = Array(result.length + 1).fill(0);
    result.forEach((coefficient, coefficientIndex) => {
      next[coefficientIndex] ^= coefficient;
      next[coefficientIndex + 1] ^= gfMultiply(coefficient, gfExp[index]);
    });
    result = next;
  }

  return result.slice(1);
}

const { exp: gfExp, log: gfLog } = createGaloisTables();

function createGaloisTables() {
  const exp = Array(512).fill(0);
  const log = Array(256).fill(0);
  let value = 1;

  for (let index = 0; index < 255; index += 1) {
    exp[index] = value;
    log[value] = index;
    value <<= 1;

    if (value & 0x100) {
      value ^= 0x11d;
    }
  }

  for (let index = 255; index < 512; index += 1) {
    exp[index] = exp[index - 255];
  }

  return { exp, log };
}

function gfMultiply(left: number, right: number) {
  return left === 0 || right === 0 ? 0 : gfExp[gfLog[left] + gfLog[right]];
}

function bytesToBits(bytes: number[]) {
  const bits: number[] = [];
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  return bits;
}

function appendBits(bits: number[], value: number, length: number) {
  for (let index = length - 1; index >= 0; index -= 1) {
    bits.push((value >>> index) & 1);
  }
}

function bitsToByte(bits: number[]) {
  return bits.reduce((byte, bit) => (byte << 1) | bit, 0);
}

function cloneMatrix(matrix: boolean[][]) {
  return matrix.map((row) => [...row]);
}

function getPenaltyScore(matrix: boolean[][]) {
  return (
    getRunPenalty(matrix) +
    getBlockPenalty(matrix) +
    getPatternPenalty(matrix) +
    getBalancePenalty(matrix)
  );
}

function getRunPenalty(matrix: boolean[][]) {
  let penalty = 0;
  const scoreLine = (line: boolean[]) => {
    let runColor = line[0];
    let runLength = 1;

    for (let index = 1; index < line.length; index += 1) {
      if (line[index] === runColor) {
        runLength += 1;
      } else {
        if (runLength >= 5) {
          penalty += runLength - 2;
        }
        runColor = line[index];
        runLength = 1;
      }
    }

    if (runLength >= 5) {
      penalty += runLength - 2;
    }
  };

  matrix.forEach(scoreLine);
  for (let x = 0; x < size; x += 1) {
    scoreLine(matrix.map((row) => row[x]));
  }

  return penalty;
}

function getBlockPenalty(matrix: boolean[][]) {
  let penalty = 0;

  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const color = matrix[y][x];
      if (
        color === matrix[y][x + 1] &&
        color === matrix[y + 1][x] &&
        color === matrix[y + 1][x + 1]
      ) {
        penalty += 3;
      }
    }
  }

  return penalty;
}

function getPatternPenalty(matrix: boolean[][]) {
  let penalty = 0;
  const pattern = [true, false, true, true, true, false, true];

  const hasPattern = (line: boolean[], index: number) =>
    pattern.every((value, offset) => line[index + offset] === value);
  const hasLightRun = (line: boolean[], start: number, end: number) =>
    start >= 0 && end <= line.length && line.slice(start, end).every((value) => !value);
  const scoreLine = (line: boolean[]) => {
    for (let index = 0; index <= line.length - 7; index += 1) {
      if (
        hasPattern(line, index) &&
        (hasLightRun(line, index - 4, index) ||
          hasLightRun(line, index + 7, index + 11))
      ) {
        penalty += 40;
      }
    }
  };

  matrix.forEach(scoreLine);
  for (let x = 0; x < size; x += 1) {
    scoreLine(matrix.map((row) => row[x]));
  }

  return penalty;
}

function getBalancePenalty(matrix: boolean[][]) {
  const dark = matrix.flat().filter(Boolean).length;
  const total = size * size;
  const percent = (dark * 100) / total;

  return Math.floor(Math.abs(percent - 50) / 5) * 10;
}
