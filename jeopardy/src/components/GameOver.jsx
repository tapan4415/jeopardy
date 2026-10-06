import '../styles/App.css';

function GameOver({ scores, clueOwners, questionsPlayed, totalClues, onPlayAgain, onExit }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topScore = sorted[0]?.[1] ?? 0;
  const leaders = sorted.filter(([, score]) => score === topScore);
  const completed = questionsPlayed >= totalClues && totalClues > 0;

  const correctByTeam = Object.values(clueOwners).reduce((totals, team) => {
    totals[team] = (totals[team] || 0) + 1;
    return totals;
  }, {});
  const totalCorrect = Object.keys(clueOwners).length;
  const unclaimed = Math.max(questionsPlayed - totalCorrect, 0);
  const progress = totalClues ? Math.round((questionsPlayed / totalClues) * 100) : 0;

  const resultLine = leaders.length > 1
    ? `${leaders.map(([team]) => team).join(' & ')} finish tied at ${topScore} points.`
    : `${leaders[0]?.[0] || 'No team'} finishes first with ${topScore} points.`;

  return (
    <div className="game-over">
      <section className="results-manifest">
        <header className="results-header">
          <div>
            <div className="results-kicker">Walmart Business CPE Team · Final Scoreboard</div>
            <h1>{completed ? 'Game Complete' : 'Game Paused'}</h1>
            <p>{resultLine}</p>
          </div>
          <div className="results-stamp">{completed ? 'FINAL' : 'TIMEOUT'}</div>
        </header>

        <div className="results-stats" aria-label="Game statistics">
          <div className="stat-card">
            <span>Questions played</span>
            <strong>{questionsPlayed}<small> / {totalClues}</small></strong>
          </div>
          <div className="stat-card">
            <span>Correct answers</span>
            <strong>{totalCorrect}</strong>
          </div>
          <div className="stat-card">
            <span>Unclaimed clues</span>
            <strong>{unclaimed}</strong>
          </div>
          <div className="stat-card">
            <span>Trip completed</span>
            <strong>{progress}<small>%</small></strong>
          </div>
        </div>

        <div className="manifest-table">
          <div className="manifest-row manifest-head">
            <span>Place</span>
            <span>Team</span>
            <span>Correct</span>
            <span>Points</span>
          </div>
          {sorted.map(([group, score], index) => (
            <div key={group} className={`manifest-row ${index === 0 ? 'leader' : ''}`}>
              <span>{index + 1}</span>
              <span>{group}</span>
              <span>{correctByTeam[group] || 0}</span>
              <strong>{score}</strong>
            </div>
          ))}
        </div>

        {!completed && (
          <p className="results-note">
            You called game with {totalClues - questionsPlayed} clues still on the board.
            “Play Again” starts a fresh round with the same teams.
          </p>
        )}

        <div className="game-over-buttons">
          <button className="game-over-btn" onClick={onPlayAgain}>Play Again</button>
          <button className="game-over-btn secondary" onClick={onExit}>Change Teams</button>
        </div>
      </section>
    </div>
  );
}

export default GameOver;
