import '../styles/GameBoard.css';

function GameBoard({ categories, usedClues, onSelectClue }) {
  const values = [20, 40, 60, 80, 100];

  return (
    <div className="game-board">
      {/* Category headers */}
      {categories.map((category, catIndex) => (
        <div key={catIndex} className="category-header">
          {category.name}
        </div>
      ))}

      {/* Clue cells - row by row */}
      {values.map((value, rowIndex) =>
        categories.map((_, catIndex) => {
          const key = `${catIndex}-${rowIndex}`;
          const isUsed = usedClues.has(key);
          return (
            <button
              key={key}
              className={`clue-cell ${isUsed ? 'used' : ''}`}
              onClick={() => !isUsed && onSelectClue(catIndex, rowIndex)}
              disabled={isUsed}
            >
              {isUsed ? '' : `${value}`}
            </button>
          );
        })
      )}
    </div>
  );
}

export default GameBoard;
