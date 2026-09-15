import { useEffect, useRef } from 'react';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const WORDS = [
  'COMMON_CORE',
  'TYPERUN',
  'FT_TRANSCENDENCE',
  'JEROME',
  'AKHMED',
  'TIMOTHEE',
  'AXEL',
  'KEVIN',
  '42',
];

const SPECIAL = '{}[]()<>;:=!|/\\&#@%*+-_~^$';
const CHAR_POOL = [...new Set([...WORDS.join(''), ...SPECIAL, '0', '1'])].join('');

const BASE_COLOR = '#9bff9b11';
const HEAD_COLOR = 'hsl(136, 100%, 95%)';

function randomChar() {
  return CHAR_POOL[randomInt(0, CHAR_POOL.length - 1)];
}

function pickWord() {
  const word = WORDS[randomInt(0, WORDS.length - 1)];
  return [...word, ' ', ' '];
}

interface Cell {
  ch: string;
  color: string;
  glow: boolean;
}

interface Flicker {
  row: number;
  interval: number;
  next: number;
}

interface Column {
  wordChars: string[] | null;
  cells: Cell[];
  flickers: Flicker[];
  trailSize: number;
  speed: number;
  offset: number;
  total: number;
  nextStep: number;
}

export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    let columns: Column[] = [];
    let charSize = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let halo: HTMLCanvasElement | null = null;

    function build() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = width + 'px';
      canvas!.style.height = height + 'px';

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      charSize = Math.max(14, Math.min(width, height) * 0.02);
      ctx!.font = charSize * 0.85 + 'px monospace';
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';

      halo = buildHalo(charSize);

      const cols = Math.ceil(width / charSize) + 2;
      rows = Math.ceil(height / charSize) + 2;

      const now = performance.now();
      columns = [];

      for (let c = 0; c < cols; c++) {
        const isWordColumn = Math.random() < 0.5;
        const wordChars = isWordColumn ? pickWord() : null;

        const cells: Cell[] = [];
        const flickers: Flicker[] = [];

        for (let i = 0; i < rows; i++) {
          const ch = wordChars ? wordChars[i % wordChars.length] : randomChar();
          cells.push({ ch, color: BASE_COLOR, glow: false });

          if (!wordChars && Math.random() < 0.5) {
            const interval = randomInt(1000, 5000);
            flickers.push({ row: i, interval, next: now + interval });
          }
        }

        const trailSize = wordChars ? wordChars.length + 2 : randomInt(10, 30);
        const speed = wordChars ? randomInt(60, 100) : randomInt(30, 80);

        columns.push({
          wordChars,
          cells,
          flickers,
          trailSize,
          speed,
          offset: randomInt(0, 100),
          total: rows + trailSize - 1,
          nextStep: now + speed,
        });
      }

      drawAll();
    }

    function buildHalo(size: number) {
      const c = document.createElement('canvas');
      c.width = c.height = Math.ceil(size);
      const hctx = c.getContext('2d')!;

      const mid = size / 2;
      const g = hctx.createRadialGradient(mid, mid, 0, mid, mid, mid);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      g.addColorStop(0.45, 'rgba(155, 255, 155, 0.30)');
      g.addColorStop(1, 'rgba(155, 255, 155, 0)');

      hctx.fillStyle = g;
      hctx.fillRect(0, 0, size, size);
      return c;
    }

    function drawCell(c: number, r: number) {
      const cell = columns[c].cells[r];
      const left = c * charSize;
      const top = r * charSize;

      ctx!.clearRect(left, top, charSize, charSize);

      if (cell.glow && cell.ch !== ' ') ctx!.drawImage(halo!, left, top, charSize, charSize);

      ctx!.fillStyle = cell.color;
      ctx!.fillText(cell.ch, left + charSize / 2, top + charSize / 2);
    }

    function drawAll() {
      ctx!.clearRect(0, 0, width, height);
      for (let c = 0; c < columns.length; c++) for (let r = 0; r < rows; r++) drawCell(c, r);
    }

    function step(col: Column) {
      const head = col.offset;

      for (let i = 0; i < col.trailSize; i++) {
        const cell = col.cells[col.offset + i - col.trailSize + 1];
        if (!cell) continue;

        if (i === col.trailSize - 1) {
          if (!col.wordChars) cell.ch = randomChar();
          cell.color = HEAD_COLOR;
          cell.glow = true;
        } else {
          const brightness = (85 / col.trailSize) * (i + 1);
          cell.color = `hsl(136, 100%, ${brightness}%)`;
          cell.glow = false;
        }
      }

      col.offset = (col.offset + 1) % col.total;
      return head;
    }

    function frame(now: number) {
      for (let c = 0; c < columns.length; c++) {
        const col = columns[c];

        for (const flicker of col.flickers) {
          if (now >= flicker.next) {
            col.cells[flicker.row].ch = randomChar();
            flicker.next = now + flicker.interval;
            drawCell(c, flicker.row);
          }
        }

        if (now >= col.nextStep) {
          const head = step(col);
          col.nextStep = now + col.speed;

          const start = Math.max(0, head - col.trailSize + 1);
          const end = Math.min(rows - 1, head);
          for (let r = start; r <= end; r++) drawCell(c, r);
        }
      }

      frameId = requestAnimationFrame(frame);
    }

    build();
    frameId = requestAnimationFrame(frame);

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none z-0" />;
}
