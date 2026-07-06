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
          <div className="header-left">
            <a href="#top" className="nav__logo">&lt;superhack0r/&gt;</a>
            <nav className="nav">
              <a href="https://luis-seibet.com" className="nav__link">Portfolio</a>
            </nav>
          </div>
          <h1 className="app-title">
            <span className="trophy">🏆</span> Realtime Leaderboard
          </h1>
          <div className="header-right">
            <ConnectionStatus connected={connected} />
          </div>
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
