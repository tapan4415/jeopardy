import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import ClueModal from './components/ClueModal';
import ScoreBoard from './components/ScoreBoard';
import GameOver from './components/GameOver';
import './styles/App.css';

// Load saved state from localStorage
function loadState() {
  try {
    const saved = localStorage.getItem('jeopardy-state');
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return null;
}

function App() {
  const saved = loadState();
  const [phase, setPhase] = useState(saved?.phase || 'setup');
  const [groups, setGroups] = useState(saved?.groups || []);
  const [scores, setScores] = useState(saved?.scores || {});
  const [currentTurn, setCurrentTurn] = useState(saved?.currentTurn || 0);
  const [usedClues, setUsedClues] = useState(new Set(saved?.usedClues || []));
  const [selectedClue, setSelectedClue] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('./data/questions.json')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error('Failed to load questions:', err));
  }, []);

  // Persist state to localStorage on changes
  useEffect(() => {
    const state = {
      phase,
      groups,
      scores,
      currentTurn,
      usedClues: [...usedClues],
    };
    localStorage.setItem('jeopardy-state', JSON.stringify(state));
  }, [phase, groups, scores, currentTurn, usedClues]);

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
    localStorage.removeItem('jeopardy-state');
    setPhase('setup');
    setGroups([]);
    setScores({});
    setCurrentTurn(0);
    setUsedClues(new Set());
    setSelectedClue(null);
  };

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit? Progress will be lost.')) {
      handlePlayAgain();
    }
  };

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStartGame} />;
  }

  if (phase === 'gameOver') {
    return <GameOver scores={scores} onPlayAgain={handlePlayAgain} onExit={handlePlayAgain} />;
  }

  return (
    <div className="game-container">
      <ScoreBoard groups={groups} scores={scores} currentTurn={currentTurn} onExitGame={handleExitGame} />
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
