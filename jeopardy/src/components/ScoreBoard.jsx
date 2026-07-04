import '../styles/ScoreBoard.css';

function ScoreBoard({ groups, scores, currentTurn, onExitGame }) {
  return (
    <div className="score-board">
      {groups.map((group, index) => (
        <div
          key={index}
          className={`score-card ${index === currentTurn ? 'active' : ''}`}
        >
          <div className="group-name">{group}</div>
          <div className="group-score">{scores[group]}</div>
          {index === currentTurn && <div className="turn-indicator">▶ Your Turn</div>}
        </div>
      ))}
      <button className="exit-button" onClick={onExitGame}>
        Exit Game
      </button>
    </div>
  );
}

export default ScoreBoard;
