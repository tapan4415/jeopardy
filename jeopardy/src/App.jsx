import { useState, useEffect, useRef } from 'react';
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
  } catch { /* ignore */ }
  return null;
}

function App() {
  const saved = loadState();
  const [isUnlocked, setIsUnlocked] = useState(sessionStorage.getItem('jeopardy-unlocked') === 'yes');
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [phase, setPhase] = useState(saved?.phase || 'setup');
  const [groups, setGroups] = useState(saved?.groups || []);
  const [scores, setScores] = useState(saved?.scores || {});
  const [currentTurn, setCurrentTurn] = useState(saved?.currentTurn || 0);
  const [usedClues, setUsedClues] = useState(new Set(saved?.usedClues || []));
  const [clueOwners, setClueOwners] = useState(saved?.clueOwners || {});
  const [selectedClue, setSelectedClue] = useState(saved?.selectedClue || null);
  const [categoryIntro, setCategoryIntro] = useState(null);
  const [introducedCategories, setIntroducedCategories] = useState(
    new Set(saved?.introducedCategories || [])
  );
  const [categories, setCategories] = useState([]);
  const [isTestRound, setIsTestRound] = useState(saved?.isTestRound || false);
  const [gameHistory, setGameHistory] = useState([]);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const categoryIntroTimer = useRef(null);

  useEffect(() => () => clearTimeout(categoryIntroTimer.current), []);

  const loadQuestions = (testMode = false) => {
    const url = testMode ? './data/test-questions.json' : './data/questions.json';
    fetch(url, { cache: 'no-store' })
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
      selectedClue,
      introducedCategories: [...introducedCategories],
    };
    localStorage.setItem('jeopardy-state', JSON.stringify(state));
  }, [
    phase,
    groups,
    scores,
    currentTurn,
    usedClues,
    clueOwners,
    isTestRound,
    selectedClue,
    introducedCategories,
  ]);

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
    setIntroducedCategories(new Set());
    setCategoryIntro(null);
    setGameHistory([]);
    setIsGamePaused(false);
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
    setIntroducedCategories(new Set());
    setCategoryIntro(null);
    setGameHistory([]);
    setIsGamePaused(false);
    setPhase('playing');
  };

  const handleSelectClue = (categoryIndex, clueIndex) => {
    const key = `${categoryIndex}-${clueIndex}`;
    if (usedClues.has(key)) return;
    const clue = categories[categoryIndex].clues[clueIndex];
    const pendingClue = { ...clue, categoryIndex, clueIndex };

    if (!introducedCategories.has(categoryIndex)) {
      const category = categories[categoryIndex];
      setIntroducedCategories((previous) => new Set(previous).add(categoryIndex));
      setCategoryIntro({ name: category.name, image: category.image });
      categoryIntroTimer.current = setTimeout(() => {
        setCategoryIntro(null);
        setSelectedClue(pendingClue);
      }, 2300);
      return;
    }

    setSelectedClue(pendingClue);
  };

  // Called when a team answers correctly
  const handleCorrect = (answeringTeamIndex) => {
    const teamName = groups[answeringTeamIndex];
    const key = `${selectedClue.categoryIndex}-${selectedClue.clueIndex}`;
    setGameHistory((history) => [...history, {
      key,
      teamName,
      points: selectedClue.value,
      previousTurn: currentTurn,
    }]);
    setScores((prev) => ({
      ...prev,
      [teamName]: prev[teamName] + selectedClue.value,
    }));

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
    setGameHistory((history) => [...history, {
      key,
      teamName: null,
      points: 0,
      previousTurn: currentTurn,
    }]);
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
    loadQuestions(isTestRound);
    const initialScores = {};
    groups.forEach((name) => {
      initialScores[name] = 0;
    });
    setScores(initialScores);
    setCurrentTurn(0);
    setUsedClues(new Set());
    setClueOwners({});
    setSelectedClue(null);
    setCategoryIntro(null);
    setIntroducedCategories(new Set());
    setGameHistory([]);
    setIsGamePaused(false);
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
    setCategoryIntro(null);
    setIntroducedCategories(new Set());
    setGameHistory([]);
    setIsGamePaused(false);
  };

  const handleUndo = () => {
    if (!gameHistory.length || selectedClue) return;
    const previous = gameHistory[gameHistory.length - 1];
    if (previous.teamName) {
      setScores((currentScores) => ({
        ...currentScores,
        [previous.teamName]: currentScores[previous.teamName] - previous.points,
      }));
    }
    setCurrentTurn(previous.previousTurn);
    setUsedClues((currentUsed) => {
      const restored = new Set(currentUsed);
      restored.delete(previous.key);
      return restored;
    });
    setClueOwners((currentOwners) => {
      const restored = { ...currentOwners };
      delete restored[previous.key];
      return restored;
    });
    setGameHistory((history) => history.slice(0, -1));
    setPhase('playing');
  };

  const handleUnlock = (event) => {
    event.preventDefault();
    const configuredPassword = import.meta.env.VITE_GAME_PASSWORD || 'babyrao2026';
    if (passwordAttempt === configuredPassword) {
      sessionStorage.setItem('jeopardy-unlocked', 'yes');
      setIsUnlocked(true);
      setPasswordError(false);
      return;
    }
    setPasswordError(true);
  };

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit the game?')) {
      setPhase('gameOver');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="password-screen">
        <form className="password-card" onSubmit={handleUnlock}>
          <div className="password-plane" aria-hidden="true">✈</div>
          <span>PRIVATE BOARDING GATE</span>
          <h1>Adventure Awaits</h1>
          <p>Enter the host password to open Baby Jeopardy.</p>
          <input
            type="password"
            value={passwordAttempt}
            onChange={(event) => setPasswordAttempt(event.target.value)}
            placeholder="Host password"
            autoFocus
          />
          {passwordError && <div className="password-error">That password is not correct.</div>}
          <button type="submit">Unlock Game</button>
        </form>
      </div>
    );
  }

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStartGame} onTestRound={handleTestRound} />;
  }

  if (phase === 'gameOver') {
    return (
      <GameOver
        scores={scores}
        clueOwners={clueOwners}
        questionsPlayed={usedClues.size}
        totalClues={totalClues}
        onPlayAgain={handlePlayAgain}
        onExit={handleNewGame}
      />
    );
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="game-header-brand">
          <span className="game-header-logo">Adventure Awaits</span>
          <span className="game-header-honorees">Vishwa &amp; Ninad's Baby Jeopardy</span>
        </div>
        <div className="game-header-route" aria-hidden="true">SAN JOSE ✈ PARENTHOOD</div>
      </header>
      <ScoreBoard
        groups={groups}
        scores={scores}
        currentTurn={currentTurn}
        onExitGame={handleExitGame}
        onUndo={handleUndo}
        canUndo={gameHistory.length > 0 && !selectedClue}
        onPauseGame={() => setIsGamePaused(true)}
      />
      <GameBoard
        categories={categories}
        usedClues={usedClues}
        clueOwners={clueOwners}
        onSelectClue={handleSelectClue}
      />
      {categoryIntro && (
        <div className="category-intro-overlay" role="status" aria-live="polite">
          <div className="category-intro-ticket">
            <div className="category-intro-kicker">Now boarding</div>
            {categoryIntro.image && <img src={categoryIntro.image} alt="" />}
            <div className="category-intro-name">{categoryIntro.name}</div>
            <div className="category-intro-route">Gate C3&nbsp;&nbsp;•&nbsp;&nbsp;Adventure Awaits</div>
          </div>
        </div>
      )}
      {selectedClue && (
        <ClueModal
          clue={selectedClue}
          groups={groups}
          currentTurn={currentTurn}
          onCorrect={handleCorrect}
          onAllFailed={handleAllFailed}
          isGamePaused={isGamePaused}
        />
      )}
      {isGamePaused && (
        <div className="game-paused-overlay" role="dialog" aria-modal="true">
          <div><span>GAME PAUSED</span><h2>Flight on hold</h2><button onClick={() => setIsGamePaused(false)}>▶ Resume Game</button></div>
        </div>
      )}
    </div>
  );
}

export default App;
