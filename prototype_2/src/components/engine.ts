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

async function loadAudio(src: string): Promise<AudioBuffer> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Failed to load ${src}: ${res.status}`);
  return getAudioContext().decodeAudioData(await res.arrayBuffer());
}

async function loadAll<K extends string, T>(
  srcs: Record<K, string>,
  load: (src: string) => Promise<T>,
): Promise<Record<K, T>> {
  const entries = await Promise.all(
    Object.entries<string>(srcs).map(async ([name, src]) => [name, await load(src)] as const),
  );
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return Object.fromEntries(entries) as Record<K, T>;
}

export const load = <KImages extends string, KSounds extends string>(
  images: Record<KImages, string>,
  sounds: Record<KSounds, string>,
) => Promise.all([loadAll(images, loadImage), loadAll(sounds, loadAudio)] as const);

export const makeLoader =
  <KImages extends string, KSounds extends string>(
    images: Record<KImages, string>,
    sounds: Record<KSounds, string>,
  ) =>
  () =>
    Promise.all([loadAll(images, loadImage), loadAll(sounds, loadAudio)] as const);

export type InferAssets<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  container: HTMLElement,
  w: number,
  h: number,
): number {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = container.getBoundingClientRect();
  const scale = Math.max(1, Math.floor(Math.min((width * dpr) / w, (height * dpr) / h)));
  canvas.width = w * scale;
  canvas.height = h * scale;
  canvas.style.width = `${canvas.width / dpr}px`;
  canvas.style.height = `${canvas.height / dpr}px`;
  ctx.imageSmoothingEnabled = false;
  return scale;
}
