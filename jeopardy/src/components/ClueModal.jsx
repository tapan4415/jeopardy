import { useState, useEffect, useCallback } from 'react';
import { useTimer } from '../hooks/useTimer';
import '../styles/ClueModal.css';

function ClueModal({ clue, groups, currentTurn, onCorrect, onAllFailed }) {
  // Track which team is currently answering within this clue
  const [answeringTeamIndex, setAnsweringTeamIndex] = useState(currentTurn);
  const [teamsAttempted, setTeamsAttempted] = useState(0);
  const [isFirstTeam, setIsFirstTeam] = useState(true);

  const duration = isFirstTeam ? 20 : 5;
  const { timeLeft, isExpired, start, reset } = useTimer(duration);

  useEffect(() => {
    start();
  }, [start]);

  const handlePass = useCallback(() => {
    const newAttempts = teamsAttempted + 1;
    if (newAttempts >= groups.length) {
      // All teams have tried and failed
      onAllFailed();
      return;
    }

    // Pass to next team with 5-second timer
    setTeamsAttempted(newAttempts);
    setIsFirstTeam(false);
    setAnsweringTeamIndex((prev) => (prev + 1) % groups.length);
  }, [teamsAttempted, groups.length, onAllFailed]);

  // When isFirstTeam changes (pass happened), restart timer
  useEffect(() => {
    if (!isFirstTeam) {
      reset();
      // Small delay to ensure reset takes effect before start
      const t = setTimeout(() => start(), 50);
      return () => clearTimeout(t);
    }
  }, [answeringTeamIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-pass when timer expires
  useEffect(() => {
    if (isExpired) {
      handlePass();
    }
  }, [isExpired]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCorrect = () => {
    onCorrect(answeringTeamIndex);
  };

  const timerPercentage = (timeLeft / duration) * 100;

  return (
    <div className="clue-modal-overlay">
      <div className="clue-modal">
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

        <div className="judge-buttons">
          <button className="btn-correct" onClick={handleCorrect}>
            ✅ Correct
          </button>
          <button className="btn-incorrect" onClick={handlePass}>
            ❌ Wrong / Pass
          </button>
        </div>

        <div className="attempts-info">
          Teams remaining: {groups.length - teamsAttempted - 1}
        </div>
      </div>
    </div>
  );
}

export default ClueModal;
