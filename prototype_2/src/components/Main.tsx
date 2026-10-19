import { useEffect, useState, useRef } from "react";

import { socket } from "./client";

import type { ServerToHostMessages } from "~/shared";
import {
  makeLoader,
  playSound,
  resizeCanvas,
  unlockAudio,
  type InferAssets,
} from "~/components/engine";

import mages from "~/images/black-mages.png";
import bgs from "~/images/ff6-backgrounds.png";
import enemies from "~/images/ff6-enemies.png";
import enemySpriteData from "~/images/ff6-enemies-sprites.json";

const USE_READY_OVERLAY = false;

// Logical (art) resolution. Everything is drawn in these units,
// then scaled up by a whole-number factor so every art pixel
// becomes an identical NxN block of screen pixels.
const LOGICAL_W = 320;
const LOGICAL_H = 180;

// Delta-time limits
const MAX_DT = 1 / 20; // clamp big gaps (tab switch, breakpoint) to 50ms
const TARGET_FPS = 60; // set to 0 to run at display refresh rate
const MIN_FRAME_TIME = TARGET_FPS > 0 ? 1000 / TARGET_FPS : 0;

const POSES = [
  "idle",
  "step",
  "defend",
  "step2",
  "downswing",
  "upswing",
  "casting1",
  "casting2",
  "cast",
  "hurt",
  "weak",
];

export const Main = () => {
  const [connected, setConnected] = useState(socket.connected);
  const [hostState, setHostState] = useState<ServerToHostMessages>({
    t: "loading",
  });

  useEffect(() => {
    //
  }, []);

  return (
    <div>
      <PixelCanvas />
    </div>
  );
};

const load = makeLoader(
  { bgs: bgs.src, mages: mages.src, enemies: enemies.src },
  {/* bounce: "TODO" */},
);

type Assets = InferAssets<typeof load>;

type Phase =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; assets: Assets }
  | { status: "running"; assets: Assets };

const overlay =
  "absolute inset-0 flex items-center justify-center bg-black/60 text-white font-mono text-base border-0";

function PixelCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [phase, setPhase] = useState<Phase>({ status: "loading" });

  const spriteRef = useRef({ x: 0, y: 0, vx: 60, vy: 40 });

  useEffect(() => {
    const container = containerRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let cancelled = false;

    const resize = () => resizeCanvas(canvas, ctx, container, LOGICAL_W, LOGICAL_H);
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener("resize", resize);
    resize();

    window.addEventListener("pointerup", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    load()
      // oxlint-disable-next-line promise/always-return
      .then((assets) => {
        if (!cancelled) {
          setPhase({ status: USE_READY_OVERLAY ? "ready" : "running", assets });
        }
      })
      .catch((err) => {
        console.error("Asset loading failed:", err);
        if (!cancelled) setPhase({ status: "error", message: err });
      });

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const assets = phase.status === "running" ? phase.assets : null;

  useEffect(() => {
    if (!assets) return () => {};
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const sprite = spriteRef.current;
    const [{ bgs, mages, enemies }, sounds] = assets;

    let rafId = 0;
    let last = performance.now();
    let lastDraw = last;

    const update = (dt: number) => {
      sprite.x += sprite.vx * dt;
      sprite.y += sprite.vy * dt;
      let bounced = false;
      if (sprite.x < 0 || sprite.x + 30 > LOGICAL_W) {
        sprite.vx *= -1;
        sprite.x = Math.max(0, Math.min(sprite.x, LOGICAL_W - 30));
        bounced = true;
      }
      if (sprite.y < 0 || sprite.y + 30 > LOGICAL_H) {
        sprite.vy *= -1;
        sprite.y = Math.max(0, Math.min(sprite.y, LOGICAL_H - 30));
        bounced = true;
      }
      // if (bounced) playSound(sounds.bounce);
    };

    const draw = () => {
      const scale = canvas.width / LOGICAL_W;

      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      ctx.drawImage(bgs, 0, 0, 256, 151, 0, 0, LOGICAL_W, LOGICAL_H);

      // round to pixels
      ctx.drawImage(mages, 0, 0, 30, 30, Math.round(sprite.x), Math.round(sprite.y), 30, 30);
    };

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);

      // Optional FPS cap (small tolerance avoids skipping on 60Hz jitter)
      if (now - lastDraw < MIN_FRAME_TIME - 1) return;
      lastDraw = now;

      // Delta time in seconds, clamped
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;

      update(dt);
      draw();
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [assets]);

  const handleStart = () => {
    if (phase.status !== "ready") return;
    unlockAudio();
    setPhase({ status: "running", assets: phase.assets });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black"
    >
      <canvas ref={canvasRef} style={{ imageRendering: "pixelated", display: "block" }} />
      {phase.status === "loading" && <div className={overlay}>Loading...</div>}
      {phase.status === "error" && (
        <div className={overlay}>
          <div>Failed to load:</div>
          <div>
            <code>
              <pre>{phase.message}</pre>
            </code>
          </div>
        </div>
      )}
      {phase.status === "ready" && (
        <button className={`${overlay} cursor-pointer`} onClick={handleStart} autoFocus>
          Click to start
        </button>
      )}
    </div>
  );
}
