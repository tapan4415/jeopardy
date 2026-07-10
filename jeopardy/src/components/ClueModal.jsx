import { useState, useEffect, useCallback } from 'react';
import { useTimer } from '../hooks/useTimer';
import '../styles/ClueModal.css';

function ClueModal({ clue, groups, currentTurn, onCorrect, onAllFailed }) {
  const [answeringTeamIndex, setAnsweringTeamIndex] = useState(currentTurn);
  const [teamsAttempted, setTeamsAttempted] = useState(0);
  const [isFirstTeam, setIsFirstTeam] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showPassMessage, setShowPassMessage] = useState(false);
  const [nextTeamName, setNextTeamName] = useState('');
  const [waitingToStart, setWaitingToStart] = useState(false);
  const [pendingNextIndex, setPendingNextIndex] = useState(null);
  const [pendingAttempts, setPendingAttempts] = useState(0);

  const duration = isFirstTeam ? 20 : 5;
  const { timeLeft, isExpired, start, stop, reset } = useTimer(duration);

  useEffect(() => {
    start();
  }, [start]);

  const handlePass = useCallback(() => {
    const newAttempts = teamsAttempted + 1;
    if (newAttempts >= groups.length) {
      onAllFailed();
      return;
    }

    const nextIndex = (answeringTeamIndex + 1) % groups.length;
    setNextTeamName(groups[nextIndex]);
    setShowPassMessage(true);
    setPendingNextIndex(nextIndex);
    setPendingAttempts(newAttempts);
    stop();
    setWaitingToStart(true);
  }, [teamsAttempted, groups, answeringTeamIndex, stop]);

  // Host clicks "Start Timer" to begin next team's turn
  const handleStartNextTeam = () => {
    setShowPassMessage(false);
    setWaitingToStart(false);
    setTeamsAttempted(pendingAttempts);
    setIsFirstTeam(false);
    setAnsweringTeamIndex(pendingNextIndex);
  };

  // Restart timer when team changes
  useEffect(() => {
    if (!isFirstTeam && !waitingToStart) {
      reset();
      const t = setTimeout(() => start(), 50);
      return () => clearTimeout(t);
    }
  }, [answeringTeamIndex, waitingToStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-pass when timer expires
  useEffect(() => {
    if (isExpired && !showPassMessage) {
      handlePass();
    }
  }, [isExpired]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCorrect = () => {
    setShowAnswer(true);
    setTimeout(() => {
      onCorrect(answeringTeamIndex);
    }, 2500);
  };

  const timerPercentage = (timeLeft / duration) * 100;

  return (
    <div className="clue-modal-overlay">
      <div className="clue-modal">
        {/* Pass message overlay with Start Timer button */}
        {showPassMessage && (
          <div className="pass-overlay">
            <div className="pass-message">
              ❌ Wrong answer!
              <div className="next-team-announce">
                Next up: <span className="next-team-name">{nextTeamName}</span>
              </div>
              <button className="btn-start-timer" onClick={handleStartNextTeam}>
                ▶ Start Timer
              </button>
            </div>
          </div>
        )}

        {/* Answer revealed overlay */}
        {showAnswer && (
          <div className="answer-overlay">
            <div className="answer-revealed">
              ✅ Correct!
              <div className="answer-text">{clue.answer}</div>
            </div>
          </div>
        )}

        <div className="timer-bar">
          <div
            className={`timer-fill ${timeLeft <= 3 ? 'urgent' : ''}`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
        <div className="timer-text">{timeLeft}s</div>

        <div className="answering-team">
          🎯 {groups[answeringTeamIndex]}'s turn to answer
        </div>

        <div className="clue-value">{clue.value}</div>
        <div className="clue-text">{clue.clue}</div>

        {clue.image && (
          <div className="clue-image-container">
            <img src={clue.image} alt="Clue" className="clue-image" />
          </div>
        )}

        {!showAnswer && !showPassMessage && (
          <div className="judge-buttons">
            <button className="btn-correct" onClick={handleCorrect}>
              ✅ Correct
            </button>
            <button className="btn-incorrect" onClick={handlePass}>
              ❌ Wrong / Pass
            </button>
          </div>
        )}

        <div className="attempts-info">
          Teams remaining: {groups.length - teamsAttempted - 1}
        </div>
      </div>
    </div>
  );
}

export default ClueModal;
