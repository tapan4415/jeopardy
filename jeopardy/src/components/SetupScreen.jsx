import { useState } from 'react';
import '../styles/App.css';

function SetupScreen({ onStart, onTestRound }) {
  const [soundStatus, setSoundStatus] = useState('');
  const [groupNames, setGroupNames] = useState([
    'Team Pilot ✈️',
    'Team Explorer 🧭',
    'Team Voyager 🌍',
    'Team Adventurer 🎈',
  ]);

  const handleChange = (index, value) => {
    const updated = [...groupNames];
    updated[index] = value;
    setGroupNames(updated);
  };

  const getNames = () => groupNames.map((name, i) => name.trim() || `Group ${i + 1}`);

  const handleStartGame = (e) => {
    e.preventDefault();
    onStart(getNames());
  };

  const handleTestRound = () => {
    onTestRound(getNames());
  };

  const handleSoundTest = async () => {
    const audio = new Audio(`${import.meta.env.BASE_URL}sounds/right/applause.mp3`);
    audio.volume = 1;
    try {
      await audio.play();
      setSoundStatus('Sound enabled ✓');
      window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 1800);
    } catch {
      setSoundStatus('Sound is blocked. Unmute this tab/site and raise media volume, then try again.');
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-ticket-label">Walmart Business · CPE Team Jeopardy</div>
      <div className="adventure-logo ufl-logo-lockup" aria-label="Walmart Business CPE Team">
        <img className="ufl-main-logo walmart-business-logo" src="./images/theme/walmart_business_logo_transparent.png" alt="Walmart Business" />
        <span className="adventure-logo-adventure">Walmart Business</span>
        <span className="adventure-logo-awaits">CPE Team</span>
      </div>
      <p className="setup-honorees"><strong>CPE Team</strong> game time</p>
      <p className="setup-subtitle">Teams ready for big ideas, quick answers, and business trivia</p>
      <form onSubmit={handleStartGame} className="setup-form">
        <h2>Team Check-In</h2>
        {groupNames.map((name, index) => (
          <div key={index} className="group-input">
            <label htmlFor={`group-${index}`}>Group {index + 1}</label>
            <input
              id={`group-${index}`}
              type="text"
              value={name}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Group ${index + 1}`}
              maxLength={20}
            />
          </div>
        ))}
        <div className="setup-buttons">
          <button type="button" className="sound-test-button" onClick={handleSoundTest}>
            🔊 Enable &amp; Test Sound
          </button>
          {soundStatus && <div className="sound-test-status" role="status">{soundStatus}</div>}
          <button type="submit" className="start-button">
            Start Game
          </button>
          <button type="button" className="test-round-button" onClick={handleTestRound}>
            Test Round
          </button>
        </div>
      </form>
    </div>
  );
}

export default SetupScreen;
