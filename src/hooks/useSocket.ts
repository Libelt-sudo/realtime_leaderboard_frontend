import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { LeaderboardEntry } from "../types";

const SOCKET_URL = import.meta.env.SOCKET_URL;

export function useSocket() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { withCredentials: true });

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("leaderboard:update", (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  return { leaderboard, connected, socket };
}
