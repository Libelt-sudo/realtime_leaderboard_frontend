import type { LeaderboardEntry, Rank } from "../types";

interface Props {
  entries: LeaderboardEntry[];
}

function getRank(score: number): Rank {
  if (score >= 5000) return "KOBOLT";
  if (score >= 3000) return "EMERALD";
  if (score >= 2000) return "DIAMOND";
  if (score >= 1000) return "PLATINUM";
  if (score >= 500) return "GOLD";
  if (score >= 200) return "SILVER";
  if (score >= 50) return "BRONZE";
  return "COPPER";
}

const RANK_META: Record<Rank, { label: string; color: string }> = {
  COPPER:   { label: "Copper",   color: "#b87333" },
  BRONZE:   { label: "Bronze",   color: "#cd7f32" },
  SILVER:   { label: "Silver",   color: "#9e9e9e" },
  GOLD:     { label: "Gold",     color: "#ffd700" },
  PLATINUM: { label: "Platinum", color: "#e5e4e2" },
  DIAMOND:  { label: "Diamond",  color: "#b9f2ff" },
  EMERALD:  { label: "Emerald",  color: "#50c878" },
  KOBOLT:   { label: "Kobolt",   color: "#7b68ee" },
};

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

export function Leaderboard({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="empty-state">No players yet. Register one to get started!</p>;
  }

  return (
    <div className="leaderboard-table-wrapper">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Rank</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const rank = getRank(entry.score);
            const meta = RANK_META[rank];
            return (
              <tr key={entry.value} className={i < 3 ? "top-three" : ""}>
                <td className="position">
                  {MEDAL[i] ?? <span className="pos-num">{i + 1}</span>}
                </td>
                <td className="username">{entry.value}</td>
                <td>
                  <span
                    className="rank-badge"
                    style={{ background: meta.color }}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="score">{entry.score.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
