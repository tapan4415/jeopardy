import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import ClueModal from './components/ClueModal';
import ScoreBoard from './components/ScoreBoard';
import GameOver from './components/GameOver';
import './styles/App.css';

function App() {
  const [phase, setPhase] = useState('setup'); // setup | playing | gameOver
  const [groups, setGroups] = useState([]);
  const [scores, setScores] = useState({});
  const [currentTurn, setCurrentTurn] = useState(0);
  const [usedClues, setUsedClues] = useState(new Set());
  const [selectedClue, setSelectedClue] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('./data/questions.json')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error('Failed to load questions:', err));
  }, []);

  const totalClues = categories.length * 5;

  const handleStartGame = (groupNames) => {
    setGroups(groupNames);
    const initialScores = {};
    groupNames.forEach((name) => {
      initialScores[name] = 0;
    });
    setScores(initialScores);
    setCurrentTurn(0);
    setUsedClues(new Set());
    setPhase('playing');
  };

  const handleSelectClue = (categoryIndex, clueIndex) => {
    const key = `${categoryIndex}-${clueIndex}`;
    if (usedClues.has(key)) return;
    const clue = categories[categoryIndex].clues[clueIndex];
    setSelectedClue({ ...clue, categoryIndex, clueIndex });
  };

  const handleJudge = (correct) => {
    if (correct) {
      setScores((prev) => ({
        ...prev,
        [groups[currentTurn]]: prev[groups[currentTurn]] + selectedClue.value,
      }));
    }

    const key = `${selectedClue.categoryIndex}-${selectedClue.clueIndex}`;
    const newUsed = new Set(usedClues);
    newUsed.add(key);
    setUsedClues(newUsed);
    setSelectedClue(null);

    setCurrentTurn((prev) => (prev + 1) % groups.length);

    if (newUsed.size >= totalClues) {
      setPhase('gameOver');
    }
  };

  const handleTimeUp = () => {
    const key = `${selectedClue.categoryIndex}-${selectedClue.clueIndex}`;
    const newUsed = new Set(usedClues);
    newUsed.add(key);
    setUsedClues(newUsed);
    setSelectedClue(null);
    setCurrentTurn((prev) => (prev + 1) % groups.length);

    if (newUsed.size >= totalClues) {
      setPhase('gameOver');
    }
  };

  const handlePlayAgain = () => {
    setPhase('setup');
    setGroups([]);
    setScores({});
    setCurrentTurn(0);
    setUsedClues(new Set());
    setSelectedClue(null);
  };

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStartGame} />;
  }

  if (phase === 'gameOver') {
    return <GameOver scores={scores} onPlayAgain={handlePlayAgain} />;
  }

  return (
    <div className="game-container">
      <ScoreBoard groups={groups} scores={scores} currentTurn={currentTurn} />
      <GameBoard
        categories={categories}
        usedClues={usedClues}
        onSelectClue={handleSelectClue}
      />
      {selectedClue && (
        <ClueModal
          clue={selectedClue}
          onJudge={handleJudge}
          onTimeUp={handleTimeUp}
        />
      )}
    </div>
  );
}

export default App;
