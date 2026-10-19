let audioCtx: AudioContext | null = null;
let audioPaused = false;

function getAudioContext(): AudioContext {
  return (audioCtx ??= new AudioContext());
}

export function unlockAudio(): void {
  if (!audioPaused) void getAudioContext().resume();
}

export function setAudioPaused(paused: boolean): Promise<void> {
  audioPaused = paused;
  const ctx = getAudioContext();
  return paused ? ctx.suspend() : ctx.resume();
}

export function playSound(buffer: AudioBuffer, volume = 1): void {
  const ctx = getAudioContext();
  if (ctx.state !== "running") return;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(ctx.destination);
  source.start();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // oxlint-disable unicorn/prefer-add-event-listener
    img.onload = () => resolve(img);
    img.onerror = reject;
    // oxlint-enable unicorn/prefer-add-event-listener
    img.src = src;
  });
}

async function loadFont(src: string, family: string): Promise<FontFace> {
  const face = new FontFace(family, `url(${src})`);
  await face.load();
  document.fonts.add(face);
  return face;
}

async function loadAudio(src: string): Promise<AudioBuffer> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Failed to load ${src}: ${res.status}`);
  return getAudioContext().decodeAudioData(await res.arrayBuffer());
}

async function loadAll<K extends string, T>(
  srcs: Record<K, string>,
  load: (src: string, name: K) => Promise<T>,
): Promise<Record<K, T>> {
  const entries = await Promise.all(
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    (Object.entries(srcs) as [K, string][]).map(
      async ([name, src]) => [name, await load(src, name)] as const,
    ),
  );
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return Object.fromEntries(entries) as Record<K, T>;
}

export const makeLoader =
  <
    KImages extends string = never,
    KSounds extends string = never,
    KFonts extends string = never,
  >(srcs: {
    images?: Record<KImages, string>;
    sounds?: Record<KSounds, string>;
    fonts?: Record<KFonts, string>;
  }) =>
  async () => {
    const [images, sounds, fonts] = await Promise.all([
      // oxlint-disable typescript/no-unsafe-type-assertion
      loadAll(srcs.images ?? ({} as Record<KImages, string>), loadImage),
      loadAll(srcs.sounds ?? ({} as Record<KSounds, string>), loadAudio),
      loadAll(srcs.fonts ?? ({} as Record<KFonts, string>), loadFont),
      // oxlint-enable typescript/no-unsafe-type-assertion
    ]);
    return { images, sounds, fonts };
  };

export type InferAssets<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  container: HTMLElement,
  logicalW: number,
  logicalH: number,
): boolean {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = container.getBoundingClientRect();
  const fit = Math.min((width * dpr) / logicalW, (height * dpr) / logicalH);

  // round to next largest
  const scale = Math.max(1, Math.ceil(fit));

  // scale down smoothed bilinear (by browser)
  canvas.style.width = `${Math.round(logicalW * fit) / dpr}px`;
  canvas.style.height = `${Math.round(logicalH * fit) / dpr}px`;

  const w = logicalW * scale;
  const h = logicalH * scale;
  if (canvas.width !== w || canvas.height !== h) {
    // this part can trigger flickering so only set them if we need it
    canvas.width = w;
    canvas.height = h;
    // gets reset on change
    ctx.imageSmoothingEnabled = false;
    return true;
  }
  return false;
}

export type DrawTextOptions = {
  font?: string;
  size?: number;
  color?: string;
  align?: CanvasTextAlign;
  shadow?: string | null;
};

const OUTLINE_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  {
    font = "monospace",
    size = 8,
    color = "#fff",
    align = "left",
    shadow = "#000",
  }: DrawTextOptions = {},
) {
  ctx.font = `${size}px "${font}"`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";

  if (shadow) {
    ctx.fillStyle = shadow;
    for (const [dx, dy] of OUTLINE_OFFSETS) {
      ctx.fillText(text, x + dx, y + dy);
    }
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
