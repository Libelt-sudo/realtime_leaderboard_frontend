import { useEffect, useRef, useState } from "react";
import { registerPlayer, updateScore } from "../api/leaderboard";

// ── Game constants ──
const WIDTH = 320;
const HEIGHT = 440;
const GRAVITY = 0.45;
const FLAP = -7.5;
const BIRD_X = 70;
const BIRD_R = 12;
const PIPE_W = 52;
const PIPE_GAP = 130;
const PIPE_SPEED = 2.4;
const PIPE_SPACING = 190; // horizontal distance between pipes

interface Pipe {
  x: number;
  gapY: number; // center of the gap
  passed: boolean;
}

interface GameState {
  birdY: number;
  vel: number;
  pipes: Pipe[];
  score: number;
  distSinceSpawn: number;
}

type Phase = "idle" | "playing" | "gameover";

function newPipe(x: number): Pipe {
  const margin = 60;
  const gapY = margin + Math.random() * (HEIGHT - PIPE_GAP - margin * 2) + PIPE_GAP / 2;
  return { x, gapY, passed: false };
}

function initialState(): GameState {
  return {
    birdY: HEIGHT / 2,
    vel: 0,
    pipes: [newPipe(WIDTH + 40)],
    score: 0,
    distSinceSpawn: 0,
  };
}

export function FlappyBird() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(initialState());
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  // Best-effort registration so /update has a player to add points to.
  async function ensureRegistered(name: string) {
    try {
      await registerPlayer(name);
    } catch {
      // Player likely already exists — that's fine.
    }
  }

  async function submitScore(name: string, finalScore: number) {
    if (finalScore <= 0) return;
    try {
      const data = await updateScore(name, finalScore);
      setMessage({ text: data.response, ok: true });
    } catch (err: unknown) {
      const e = err as { error?: string; details?: { message: string }[] };
      const detail = e.details?.[0]?.message ?? e.error ?? "Score submission failed";
      setMessage({ text: detail, ok: false });
    }
  }

  function startGame() {
    const name = username.trim();
    if (!name) return;
    setMessage(null);
    setScore(0);
    stateRef.current = initialState();
    void ensureRegistered(name);
    setPhase("playing");
  }

  function flap() {
    if (phaseRef.current !== "playing") return;
    stateRef.current.vel = FLAP;
  }

  // Game loop — runs while phase === "playing".
  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;

    const css = getComputedStyle(document.documentElement);
    const colBg = css.getPropertyValue("--bg").trim() || "#0f0f1a";
    const colSurface = css.getPropertyValue("--surface-2").trim() || "#16213e";
    const colAccent = css.getPropertyValue("--accent").trim() || "#7c3aed";
    const colText = css.getPropertyValue("--text").trim() || "#e2e8f0";

    function endGame() {
      const finalScore = stateRef.current.score;
      setScore(finalScore);
      setPhase("gameover");
      void submitScore(username.trim(), finalScore);
    }

    function step() {
      const s = stateRef.current;

      // Physics
      s.vel += GRAVITY;
      s.birdY += s.vel;

      // Pipes
      s.distSinceSpawn += PIPE_SPEED;
      for (const p of s.pipes) p.x -= PIPE_SPEED;
      if (s.distSinceSpawn >= PIPE_SPACING) {
        s.pipes.push(newPipe(WIDTH + 40));
        s.distSinceSpawn = 0;
      }
      s.pipes = s.pipes.filter((p) => p.x + PIPE_W > 0);

      // Score + collision
      for (const p of s.pipes) {
        if (!p.passed && p.x + PIPE_W < BIRD_X - BIRD_R) {
          p.passed = true;
          s.score += 1;
          setScore(s.score);
        }
        const withinX = BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W;
        const topGap = p.gapY - PIPE_GAP / 2;
        const botGap = p.gapY + PIPE_GAP / 2;
        const hitsPipe =
          withinX && (s.birdY - BIRD_R < topGap || s.birdY + BIRD_R > botGap);
        if (hitsPipe) {
          endGame();
          return;
        }
      }

      // Ground / ceiling
      if (s.birdY + BIRD_R > HEIGHT || s.birdY - BIRD_R < 0) {
        endGame();
        return;
      }

      // ── Draw ──
      ctx!.fillStyle = colBg;
      ctx!.fillRect(0, 0, WIDTH, HEIGHT);

      ctx!.fillStyle = colSurface;
      for (const p of s.pipes) {
        const topH = p.gapY - PIPE_GAP / 2;
        ctx!.fillRect(p.x, 0, PIPE_W, topH);
        ctx!.fillRect(p.x, p.gapY + PIPE_GAP / 2, PIPE_W, HEIGHT);
      }
      // pipe edges
      ctx!.strokeStyle = colAccent;
      ctx!.lineWidth = 2;
      for (const p of s.pipes) {
        const topH = p.gapY - PIPE_GAP / 2;
        ctx!.strokeRect(p.x, 0, PIPE_W, topH);
        ctx!.strokeRect(p.x, p.gapY + PIPE_GAP / 2, PIPE_W, HEIGHT - (p.gapY + PIPE_GAP / 2));
      }

      // bird
      ctx!.fillStyle = colAccent;
      ctx!.beginPath();
      ctx!.arc(BIRD_X, s.birdY, BIRD_R, 0, Math.PI * 2);
      ctx!.fill();
      // eye
      ctx!.fillStyle = colText;
      ctx!.beginPath();
      ctx!.arc(BIRD_X + 4, s.birdY - 3, 2.5, 0, Math.PI * 2);
      ctx!.fill();

      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);

    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.key === " " || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    }
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="card game-card">
      <h2>🐤 Flappy Bird</h2>

      {phase === "idle" && (
        <div className="form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={32}
          />
          <button type="button" onClick={startGame} disabled={!username.trim()}>
            Start Game
          </button>
          <p className="game-hint">Press Space or click to flap.</p>
        </div>
      )}

      {phase === "playing" && (
        <div className="game-stage">
          <div className="game-score-live">{score}</div>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="game-canvas"
            onPointerDown={(e) => {
              e.preventDefault();
              flap();
            }}
          />
        </div>
      )}

      {phase === "gameover" && (
        <div className="game-over">
          <p className="game-over-title">Game Over</p>
          <p className="game-final-score">
            Score: <strong>{score}</strong>
          </p>
          {message && (
            <p className={`form-message ${message.ok ? "success" : "error"}`}>
              {message.text}
            </p>
          )}
          <button type="button" className="game-play-again" onClick={startGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
