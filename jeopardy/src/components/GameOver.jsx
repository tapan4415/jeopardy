import '../styles/App.css';

function GameOver({ scores, onPlayAgain, onExit }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0];

  return (
    <div className="game-over">
      <h1 className="game-over-title">GAME OVER!</h1>
      <div className="winner-announcement">
        🏆 <span className="winner-name">{winner[0]}</span> wins with {winner[1]} points!
      </div>
      <div className="final-scores">
        <h2>Final Scores</h2>
        {sorted.map(([group, score], index) => (
          <div key={group} className={`final-score-row ${index === 0 ? 'first' : ''}`}>
            <span className="rank">#{index + 1}</span>
            <span className="name">{group}</span>
            <span className="score">{score}</span>
          </div>
        ))}
      </div>
      <div className="game-over-buttons">
        <button className="play-again-button" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="exit-button" onClick={onExit}>
          New Game
        </button>
      </div>
    </div>
  );
}

export default GameOver;
