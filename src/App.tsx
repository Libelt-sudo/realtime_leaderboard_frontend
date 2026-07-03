import { useSocket } from "./hooks/useSocket";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { Leaderboard } from "./components/Leaderboard";
import { FlappyBird } from "./components/FlappyBird";
import "./App.css";

function App() {
  const { leaderboard, connected } = useSocket();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">
            <span className="trophy">🏆</span> Realtime Leaderboard
          </h1>
          <ConnectionStatus connected={connected} />
        </div>
      </header>

      <main className="app-main">
        <section className="game-section">
          <FlappyBird />
        </section>

        <aside className="leaderboard-section">
          <h2 className="section-title">Rankings</h2>
          <Leaderboard entries={leaderboard} />
        </aside>
      </main>
    </div>
  );
}

export default App;
