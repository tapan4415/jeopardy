import { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import '../styles/ClueModal.css';

function ClueModal({ clue, onJudge, onTimeUp }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const { timeLeft, isExpired, start } = useTimer(20);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (isExpired && !showAnswer) {
      setShowAnswer(true);
    }
  }, [isExpired, showAnswer]);

  const handleReveal = () => {
    setShowAnswer(true);
  };

  const handleCorrect = () => {
    onJudge(true);
  };

  const handleIncorrect = () => {
    onJudge(false);
  };

  const handleTimeUpDismiss = () => {
    onTimeUp();
  };

  const timerPercentage = (timeLeft / 20) * 100;

  return (
    <div className="clue-modal-overlay">
      <div className="clue-modal">
        <div className="timer-bar">
          <div
            className={`timer-fill ${timeLeft <= 5 ? 'urgent' : ''}`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
        <div className="timer-text">{timeLeft}s</div>

        <div className="clue-value">${clue.value}</div>
        <div className="clue-text">{clue.clue}</div>

        {showAnswer && (
          <div className="answer-section">
            <div className="answer-text">{clue.answer}</div>
            {isExpired ? (
              <div className="judge-buttons">
                <button className="btn-timeout" onClick={handleTimeUpDismiss}>
                  Time's Up — Next Turn
                </button>
              </div>
            ) : (
              <div className="judge-buttons">
                <button className="btn-correct" onClick={handleCorrect}>
                  ✅ Correct
                </button>
                <button className="btn-incorrect" onClick={handleIncorrect}>
                  ❌ Incorrect
                </button>
              </div>
            )}
          </div>
        )}

        {!showAnswer && !isExpired && (
          <button className="reveal-button" onClick={handleReveal}>
            Reveal Answer
          </button>
        )}
      </div>
    </div>
  );
}

export default ClueModal;
