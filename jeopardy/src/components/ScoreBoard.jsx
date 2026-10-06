import '../styles/ScoreBoard.css';

function ScoreBoard({
  groups,
  scores,
  currentTurn,
  onExitGame,
  onUndo,
  canUndo,
  onPauseGame,
  onToggleFullscreen,
  isFullscreen,
}) {
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
      <div className="host-board-controls">
        <button className="fullscreen-button" onClick={onToggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
        <button className="pause-game-button" onClick={onPauseGame}>⏸ Pause</button>
        <button className="undo-button" onClick={onUndo} disabled={!canUndo}>↶ Undo</button>
        <button className="exit-button" onClick={onExitGame}>Exit Game</button>
      </div>
    </div>
  );
}

export default ScoreBoard;
