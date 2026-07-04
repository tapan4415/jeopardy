import '../styles/GameBoard.css';

function GameBoard({ categories, usedClues, clueOwners, onSelectClue }) {
  if (categories.length === 0) return null;

  const numRows = categories[0].clues.length;

  return (
    <div className="game-board" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
      {/* Category headers */}
      {categories.map((category, catIndex) => (
        <div key={catIndex} className="category-header">
          {category.name}
        </div>
      ))}

      {/* Clue cells - row by row */}
      {Array.from({ length: numRows }, (_, rowIndex) =>
        categories.map((cat, catIndex) => {
          const key = `${catIndex}-${rowIndex}`;
          const isUsed = usedClues.has(key);
          const owner = clueOwners[key];
          const value = cat.clues[rowIndex]?.value;
          return (
            <button
              key={key}
              className={`clue-cell ${isUsed ? (owner ? 'owned' : 'used') : ''}`}
              onClick={() => !isUsed && onSelectClue(catIndex, rowIndex)}
              disabled={isUsed}
            >
              {isUsed ? (owner || '') : `${value}`}
            </button>
          );
        })
      )}
    </div>
  );
}

export default GameBoard;
