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
  const [clueOwners, setClueOwners] = useState(saved?.clueOwners || {});
  const [selectedClue, setSelectedClue] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isTestRound, setIsTestRound] = useState(saved?.isTestRound || false);

  const loadQuestions = (testMode = false) => {
    const url = testMode ? './data/test-questions.json' : './data/questions.json';
    fetch(url)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error('Failed to load questions:', err));
  };

  useEffect(() => {
    loadQuestions(isTestRound);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist state to localStorage on changes
  useEffect(() => {
    const state = {
      phase,
      groups,
      scores,
      currentTurn,
      usedClues: [...usedClues],
      clueOwners,
      isTestRound,
    };
    localStorage.setItem('jeopardy-state', JSON.stringify(state));
  }, [phase, groups, scores, currentTurn, usedClues, clueOwners, isTestRound]);

  const totalClues = categories.reduce((sum, cat) => sum + cat.clues.length, 0);

  const handleStartGame = (groupNames) => {
    setIsTestRound(false);
    loadQuestions(false);
    setGroups(groupNames);
    const initialScores = {};
    groupNames.forEach((name) => {
      initialScores[name] = 0;
    });
    setScores(initialScores);
    setCurrentTurn(0);
    setUsedClues(new Set());
    setClueOwners({});
    setPhase('playing');
  };

  const handleTestRound = (groupNames) => {
    setIsTestRound(true);
    loadQuestions(true);
    setGroups(groupNames);
    const initialScores = {};
    groupNames.forEach((name) => {
      initialScores[name] = 0;
    });
    setScores(initialScores);
    setCurrentTurn(0);
    setUsedClues(new Set());
    setClueOwners({});
    setPhase('playing');
  };

  const handleSelectClue = (categoryIndex, clueIndex) => {
    const key = `${categoryIndex}-${clueIndex}`;
    if (usedClues.has(key)) return;
    const clue = categories[categoryIndex].clues[clueIndex];
    setSelectedClue({ ...clue, categoryIndex, clueIndex });
  };

  // Called when a team answers correctly
  const handleCorrect = (answeringTeamIndex) => {
    const teamName = groups[answeringTeamIndex];
    setScores((prev) => ({
      ...prev,
      [teamName]: prev[teamName] + selectedClue.value,
    }));

    const key = `${selectedClue.categoryIndex}-${selectedClue.clueIndex}`;
    const newUsed = new Set(usedClues);
    newUsed.add(key);
    setUsedClues(newUsed);
    setClueOwners((prev) => ({ ...prev, [key]: teamName }));
    setSelectedClue(null);
    setCurrentTurn((prev) => (prev + 1) % groups.length);

    if (newUsed.size >= totalClues) {
      setPhase('gameOver');
    }
  };

  // Called when all teams fail to answer
  const handleAllFailed = () => {
    const key = `${selectedClue.categoryIndex}-${selectedClue.clueIndex}`;
    const newUsed = new Set(usedClues);
    newUsed.add(key);
    setUsedClues(newUsed);
    // No owner — cell stays blank
    setSelectedClue(null);
    setCurrentTurn((prev) => (prev + 1) % groups.length);

    if (newUsed.size >= totalClues) {
      setPhase('gameOver');
    }
  };

  // Same teams, reset scores, replay
  const handlePlayAgain = () => {
    const initialScores = {};
    groups.forEach((name) => {
      initialScores[name] = 0;
    });
    setScores(initialScores);
    setCurrentTurn(0);
    setUsedClues(new Set());
    setClueOwners({});
    setSelectedClue(null);
    setPhase('playing');
  };

  // Back to setup for new teams
  const handleNewGame = () => {
    localStorage.removeItem('jeopardy-state');
    setPhase('setup');
    setGroups([]);
    setScores({});
    setCurrentTurn(0);
    setUsedClues(new Set());
    setClueOwners({});
    setSelectedClue(null);
  };

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit the game?')) {
      setPhase('gameOver');
    }
  };

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStartGame} onTestRound={handleTestRound} />;
  }

  if (phase === 'gameOver') {
    return <GameOver scores={scores} onPlayAgain={handlePlayAgain} onExit={handleNewGame} />;
  }

  return (
    <div className="game-container">
      <ScoreBoard groups={groups} scores={scores} currentTurn={currentTurn} onExitGame={handleExitGame} />
      <GameBoard
        categories={categories}
        usedClues={usedClues}
        clueOwners={clueOwners}
        onSelectClue={handleSelectClue}
      />
      {selectedClue && (
        <ClueModal
          clue={selectedClue}
          groups={groups}
          currentTurn={currentTurn}
          onCorrect={handleCorrect}
          onAllFailed={handleAllFailed}
        />
      )}
    </div>
  );
}

export default App;
