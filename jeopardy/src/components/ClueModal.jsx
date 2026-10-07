import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimer } from '../hooks/useTimer';
import '../styles/ClueModal.css';

const WRONG_SOUNDS = [
  './sounds/wrong/downer_noise.mp3',
];

const RIGHT_SOUNDS = [
  './sounds/right/applause.mp3',
];

let nextWrongSoundIndex = 0;
let nextRightSoundIndex = 0;
let stopActiveFeedbackSound = null;
const feedbackAudioCache = new Map();
const MAX_FEEDBACK_AUDIO_MS = 5000;

function getFeedbackAudio(src) {
  if (!feedbackAudioCache.has(src)) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.load();
    feedbackAudioCache.set(src, audio);
  }
  return feedbackAudioCache.get(src);
}

function playCappedSound(src, label) {
  return new Promise((resolve) => {
    const audio = getFeedbackAudio(src);
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(limitTimer);
      audio.pause();
      audio.currentTime = 0;
      if (stopActiveFeedbackSound === finish) stopActiveFeedbackSound = null;
      resolve();
    };

    const limitTimer = setTimeout(finish, MAX_FEEDBACK_AUDIO_MS);
    stopActiveFeedbackSound?.();
    stopActiveFeedbackSound = finish;
    audio.currentTime = 0;
    audio.volume = 1;
    audio.addEventListener('ended', finish, { once: true });
    audio.addEventListener('error', finish, { once: true });
    audio.play().catch((error) => {
      console.warn(`Unable to play ${label} sound:`, error);
      finish();
    });
  });
}

function ClueModal({ clue, groups, currentTurn, onCorrect, onAllFailed, onBackToBoard, isGamePaused }) {
  const isTimedAudioClue = clue.media?.type === 'timed-audio';
  const clueAudioRef = useRef(null);
  const audioIntroFinishedRef = useRef(false);
  const gamePauseWasRunningRef = useRef(false);
  const [answeringTeamIndex, setAnsweringTeamIndex] = useState(currentTurn);
  const [teamsAttempted, setTeamsAttempted] = useState(0);
  const [isFirstTeam, setIsFirstTeam] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [showPassMessage, setShowPassMessage] = useState(false);
  const [nextTeamName, setNextTeamName] = useState('');
  const [waitingToStart, setWaitingToStart] = useState(false);
  const [pendingNextIndex, setPendingNextIndex] = useState(null);
  const [pendingAttempts, setPendingAttempts] = useState(0);
  const [isFeedbackPlaying, setIsFeedbackPlaying] = useState(false);
  const [audioIntroDone, setAudioIntroDone] = useState(!isTimedAudioClue);
  const [needsManualAudioStart, setNeedsManualAudioStart] = useState(isTimedAudioClue);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isTuneReplaying, setIsTuneReplaying] = useState(false);
  const [revealMore, setRevealMore] = useState(false);
  const [isMediaZoomed, setIsMediaZoomed] = useState(false);

  const duration = isFirstTeam ? 20 : 5;
  const { timeLeft, isRunning, isExpired, start, stop, resume, reset } = useTimer(duration);

  const playWrongSound = useCallback(() => {
    const src = WRONG_SOUNDS[nextWrongSoundIndex];
    nextWrongSoundIndex = (nextWrongSoundIndex + 1) % WRONG_SOUNDS.length;
    return playCappedSound(src, 'wrong-answer');
  }, []);

  const playRightSound = useCallback(() => {
    const src = RIGHT_SOUNDS[nextRightSoundIndex];
    nextRightSoundIndex = (nextRightSoundIndex + 1) % RIGHT_SOUNDS.length;
    return playCappedSound(src, 'correct-answer');
  }, []);

  const finishAudioIntro = useCallback(() => {
    if (isTuneReplaying) {
      setIsTuneReplaying(false);
      resume();
      return;
    }
    if (audioIntroFinishedRef.current) return;
    audioIntroFinishedRef.current = true;
    if (clueAudioRef.current) {
      clueAudioRef.current.pause();
      clueAudioRef.current.currentTime = 0;
    }
    setAudioIntroDone(true);
    setTimerStarted(true);
    start();
  }, [isTuneReplaying, resume, start]);

  const playTune = useCallback(async () => {
    const audio = clueAudioRef.current;
    if (!audio || audioIntroFinishedRef.current) return;
    try {
      audio.currentTime = 0;
      await audio.play();
      setNeedsManualAudioStart(false);
    } catch {
      setNeedsManualAudioStart(true);
    }
  }, []);

  useEffect(() => () => {
    clueAudioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (isGamePaused) {
      gamePauseWasRunningRef.current = isRunning;
      stop();
      clueAudioRef.current?.pause();
    } else if (gamePauseWasRunningRef.current && timerStarted && !showAnswer) {
      gamePauseWasRunningRef.current = false;
      resume();
    }
  }, [isGamePaused]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePass = useCallback(async () => {
    if (isFeedbackPlaying) return;
    stop();
    setIsFeedbackPlaying(true);
    const newAttempts = teamsAttempted + 1;
    if (newAttempts >= groups.length) {
      await playWrongSound();
      setIsFeedbackPlaying(false);
      setAnswerResult('all-failed');
      setShowAnswer(true);
      return;
    }

    const nextIndex = (answeringTeamIndex + 1) % groups.length;
    setNextTeamName(groups[nextIndex]);
    setShowPassMessage(true);
    setPendingNextIndex(nextIndex);
    setPendingAttempts(newAttempts);
    setWaitingToStart(true);
    await playWrongSound();
    setIsFeedbackPlaying(false);
  }, [isFeedbackPlaying, teamsAttempted, groups, answeringTeamIndex, stop, playWrongSound]);

  // Host clicks "Start Timer" to begin next team's turn
  const handleStartNextTeam = () => {
    stopActiveFeedbackSound?.();
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

  const handleCorrect = async () => {
    if (isFeedbackPlaying) return;
    stop();
    setIsFeedbackPlaying(true);
    setAnswerResult('correct');
    setShowAnswer(true);
    await playRightSound();
    setIsFeedbackPlaying(false);
  };

  const handleContinue = () => {
    stopActiveFeedbackSound?.();
    if (answerResult === 'correct') onCorrect(answeringTeamIndex);
    else onAllFailed();
  };

  const handleBackToBoard = () => {
    stop();
    stopActiveFeedbackSound?.();
    if (clueAudioRef.current) {
      clueAudioRef.current.pause();
      clueAudioRef.current.currentTime = 0;
    }
    onBackToBoard();
  };

  const handleStartQuestionTimer = () => {
    setTimerStarted(true);
    start();
  };

  const handleToggleTimer = () => {
    if (isRunning) stop();
    else if (!isExpired) resume();
  };

  const handleReplayTune = async () => {
    const audio = clueAudioRef.current;
    if (!audio || isTuneReplaying) return;
    stop();
    setIsTuneReplaying(true);
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setIsTuneReplaying(false);
      resume();
    }
  };

  const timerPercentage = (timeLeft / duration) * 100;
  const media = clue.media || (clue.image
    ? { type: 'image', src: clue.image, alt: clue.clue }
    : null);

  const renderMedia = () => {
    const interaction = clue.interaction;

    if (interaction?.type === 'progressive-image') {
      return (
        <div className="interactive-media">
          <div className={`progressive-image ${revealMore ? 'is-expanded' : ''}`}>
            <img src={interaction.src} alt={interaction.alt || 'Cropped landmark clue'} />
          </div>
          {!revealMore && (
            <button className="interaction-button" onClick={() => setRevealMore(true)}>Reveal More</button>
          )}
        </div>
      );
    }

    if (interaction?.type === 'image-grid') {
      return (
        <div className="interactive-media">
          <div className="visual-clue-grid">
            {interaction.items.map((item) => (
              <figure className="visual-clue-card" key={item.src}>
                <img src={item.src} alt={showAnswer ? item.label : 'Unlabelled visual clue'} />
                {showAnswer && <figcaption>{item.label}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      );
    }

    if (interaction?.type === 'option-image-grid') {
      return (
        <div className="option-image-grid">
          {interaction.items.map((item) => (
            <figure className="option-image-card" key={item.label}>
              <div className="option-label">{item.label}</div>
              <img src={item.src} alt={item.caption} />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      );
    }

    if (interaction?.type === 'zoom-image') {
      return (
        <div className="interactive-media">
          <button
            className={`zoom-image ${isMediaZoomed ? 'is-zoomed' : ''}`}
            onClick={() => setIsMediaZoomed((value) => !value)}
            aria-label={isMediaZoomed ? 'Zoom out' : 'Zoom in'}
          >
            <img src={interaction.src} alt={interaction.alt || 'Aerial landmark clue'} />
          </button>
          <span className="zoom-instruction">{isMediaZoomed ? 'Tap image to zoom out' : 'Tap image to zoom in'}</span>
        </div>
      );
    }

    if (interaction?.type === 'image-clue') {
      return (
        <div className="monument-image-stage">
          <img src={interaction.src} alt={interaction.alt || 'Monument clue'} />
          {showAnswer && interaction.revealBadge && <span className="reveal-location">{interaction.revealBadge}</span>}
        </div>
      );
    }

    if (interaction?.type === 'covered-image-reveal') {
      const isRevealed = revealMore || showAnswer;
      const visibleSrc = isRevealed && interaction.revealSrc ? interaction.revealSrc : interaction.src;
      return (
        <div className="interactive-media">
          <div className={`covered-image-stage ${isRevealed ? 'is-revealed' : ''}`}>
            <img src={visibleSrc} alt={interaction.alt || 'Covered visual clue'} />
            {!isRevealed && <div className="image-cover" aria-hidden="true" />}
          </div>
          {!isRevealed && (
            <button className="interaction-button" onClick={() => setRevealMore(true)}>Reveal Face</button>
          )}
        </div>
      );
    }

    if (interaction?.type === 'newborn-vision') {
      return (
        <div className="newborn-vision-stage">
          <img src={interaction.src} alt={interaction.alt} />
          {showAnswer && (
            <div className="distance-reveal" aria-label="Newborn and caregiver faces are 8 to 12 inches apart">
              <span>👶</span><i /><strong>8–12 INCHES</strong><i /><span>🧑</span>
            </div>
          )}
        </div>
      );
    }

    if (interaction?.type === 'food-passport') {
      return showAnswer ? (
        <div className="food-reveal-stage"><img src={interaction.revealSrc} alt="Sliced pistachio baklava" /></div>
      ) : (
        <div className="food-passport">
          <div className="passport-stamps" aria-hidden="true">✈︎　PASSPORT　✦　ENTRY</div>
          {interaction.clues.map((item) => <div className="passport-field" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
        </div>
      );
    }

    if (interaction?.type === 'translation-clue') {
      return showAnswer ? (
        <div className="food-reveal-stage"><img src={interaction.revealSrc} alt="Traditional dim sum spread" /></div>
      ) : (
        <div className="translation-stage"><span>“</span><strong>{interaction.phrase}</strong><span>”</span><small>LANGUAGE STAMP　•　CULINARY ENTRY</small></div>
      );
    }

    if (interaction?.type === 'food-connection') {
      return (
        <div className={`food-connection ${showAnswer ? 'is-solved' : ''}`}>
          <img className="connection-dishes" src={interaction.src} alt="Pad Thai, sambar, and an unbranded dark sauce" />
          <div className="connection-labels"><span>PAD THAI</span><span>SAMBAR</span><span>WORCESTERSHIRE SAUCE</span></div>
          <div className="connection-lines" aria-hidden="true"><i /><i /><i /></div>
          {showAnswer ? <div className="connection-answer"><img src={interaction.revealSrc} alt="Tamarind pods and pulp" /><strong>TAMARIND</strong></div> : <div className="connection-mystery">?</div>}
        </div>
      );
    }

    if (interaction?.type === 'food-map') {
      return (
        <div className={`food-map-stage ${showAnswer ? 'is-solved' : ''}`}>
          <img src={interaction.src} alt="An unlabeled country silhouette filled with four foods" />
          {showAnswer && <div className="map-reveal"><strong>🇲🇾 MALAYSIA</strong><span>NASI LEMAK　•　SATAY　•　LAKSA　•　ROTI CANAI</span></div>}
        </div>
      );
    }

    if (interaction?.type === 'sequential-clues') {
      return (
        <div className="interactive-media">
          <div className="sequential-clues">
            {interaction.clues.map((item, index) => (
              <div className="sequential-clue" key={item} style={{ '--clue-delay': `${index * 70}ms` }}>
                <span>CLUE {index + 1}</span>{item}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!media?.src) return null;

    if (media.type === 'audio') {
      return (
        <div className="clue-media-container">
          <audio controls preload="metadata" src={media.src}>
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    if (media.type === 'timed-audio') {
      return (
        <div className={`tune-player ${audioIntroDone && !isTuneReplaying ? 'is-finished' : 'is-playing'}`}>
          <audio className="tune-audio-controls" ref={clueAudioRef} controls preload="auto" src={media.src} onEnded={finishAudioIntro}>
            Your browser cannot play this audio format.
          </audio>
          <div className="sound-bars" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
          <strong>{isTuneReplaying ? 'PLAYING AGAIN — TIMER PAUSED' : audioIntroDone ? 'TUNE COMPLETE — TIMER STARTED' : 'LISTEN CAREFULLY…'}</strong>
          <span>{audioIntroDone ? 'Name that tune!' : 'The timer begins when the full clip ends.'}</span>
          {needsManualAudioStart && !audioIntroDone && (
            <button className="play-tune-button" onClick={playTune}>▶ Play Tune</button>
          )}
          {audioIntroDone && !isTuneReplaying && !showAnswer && (
            <button className="play-tune-button replay-tune-button" onClick={handleReplayTune}>↻ Play Tune Again</button>
          )}
        </div>
      );
    }

    if (media.type === 'video') {
      return (
        <div className="clue-media-container">
          <video controls preload="metadata" poster={media.poster}>
            <source src={media.src} type={media.mimeType || 'video/mp4'} />
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    return (
      <div className="clue-media-container">
        <img src={media.src} alt={media.alt || 'Clue'} />
      </div>
    );
  };

  const renderAnswerMedia = () => {
    const answerMedia = clue.answerMedia;
    if (!answerMedia?.src) return null;

    if (answerMedia.type === 'video') {
      return (
        <div className="answer-media">
          <video controls autoPlay preload="metadata">
            <source src={answerMedia.src} type={answerMedia.mimeType || 'video/mp4'} />
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    if (answerMedia.type === 'image') {
      return (
        <div className="answer-media">
          <img src={answerMedia.src} alt={answerMedia.alt || 'Answer visual'} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="clue-modal-overlay">
      <div className={`clue-modal ${clue.interaction ? 'visual-clue-modal' : ''}`}>
        <button className="back-to-board-button" onClick={handleBackToBoard}>
          ← Back to Board
        </button>
        {/* Pass message overlay with Start Timer button */}
        {showPassMessage && (
          <div className="pass-overlay wrong-feedback">
            <div className="wrong-particles" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => <span key={index}>×</span>)}
            </div>
            <div className="pass-message">
              <span className="feedback-icon wrong-icon" aria-hidden="true">✕</span>
              <span>Wrong answer!</span>
              <div className="next-team-announce">
                Next up: <span className="next-team-name">{nextTeamName}</span>
              </div>
              <button className="btn-start-timer" onClick={handleStartNextTeam}>
                ▶ Start Timer
              </button>
              <button className="feedback-sound-button" onClick={playWrongSound}>
                🔊 Replay Wrong Sound
              </button>
            </div>
          </div>
        )}

        {/* Answer revealed overlay */}
        {showAnswer && (
          <div className={`answer-overlay ${clue.interaction ? 'interaction-answer' : ''} ${answerResult === 'correct' ? 'correct-feedback' : 'all-failed-feedback'}`}>
            {answerResult === 'correct' && (
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
              </div>
            )}
            <div className="answer-revealed">
              <span className={`feedback-icon ${answerResult === 'correct' ? 'correct-icon' : ''}`} aria-hidden="true">
                {answerResult === 'correct' ? '✓' : '⏰'}
              </span>
              <span>{answerResult === 'correct' ? 'Correct!' : 'No team answered'}</span>
              <div className="answer-text">{clue.answer}</div>
              {clue.explanation && (
                <div className="answer-explanation">
                  <span>Why:</span> {clue.explanation}
                </div>
              )}
              {clue.funFact && (
                <div className="answer-explanation fun-fact">
                  <span>Fun fact:</span> {clue.funFact}
                </div>
              )}
              {renderAnswerMedia()}
              <button
                className="feedback-sound-button"
                onClick={answerResult === 'correct' ? playRightSound : playWrongSound}
              >
                🔊 Replay {answerResult === 'correct' ? 'Correct' : 'Wrong'} Sound
              </button>
              <button className="answer-continue-button" onClick={handleContinue}>Continue to Board →</button>
            </div>
          </div>
        )}

        <div className="answering-team">
          🎯 {groups[answeringTeamIndex]}'s turn to answer
        </div>

        <div className="clue-value">{clue.value} POINTS</div>
        {clue.title && <div className="clue-title">{clue.title}</div>}
        {clue.supportingLine && <div className="clue-supporting-line">{clue.supportingLine}</div>}
        <div className="clue-text">{clue.clue}</div>

        {renderMedia()}

        {!timerStarted && !isTimedAudioClue && !showAnswer && (
          <button className="start-question-timer" onClick={handleStartQuestionTimer}>▶ Start Timer</button>
        )}

        {timerStarted && !showAnswer && (
          <div className="timer-control-panel">
            <div className="timer-bar">
              <div
                className={`timer-fill ${timeLeft <= 3 ? 'urgent' : ''}`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
            <div className="timer-status-row">
              <div className={`timer-text ${isExpired ? 'expired' : ''}`}>
                {isExpired ? 'TIME’S UP — HOST DECIDES' : `${timeLeft}s`}
              </div>
              {!isExpired && (
                <button className="pause-timer-button" onClick={handleToggleTimer} disabled={isTuneReplaying}>
                  {isRunning ? '⏸ Pause Timer' : '▶ Resume Timer'}
                </button>
              )}
            </div>
          </div>
        )}

        {!showAnswer && !showPassMessage && audioIntroDone && timerStarted && !isTuneReplaying && (
          <div className="judge-buttons">
            <button className="btn-correct" onClick={handleCorrect} disabled={isFeedbackPlaying}>
              ✅ Correct
            </button>
            <button className="btn-incorrect" onClick={handlePass} disabled={isFeedbackPlaying}>
              ❌ Wrong / Pass
            </button>
          </div>
        )}

        <div className="attempts-info">
          Teams remaining after this team: {groups.length - teamsAttempted - 1}
        </div>
      </div>
    </div>
  );
}

export default ClueModal;
