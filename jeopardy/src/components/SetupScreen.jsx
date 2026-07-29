import { useState } from 'react';
import '../styles/App.css';

function SetupScreen({ onStart, onTestRound }) {
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

  return (
    <div className="setup-screen">
      <div className="setup-ticket-label">Gate C3 · Baby Jeopardy</div>
      <div className="adventure-logo" aria-label="Adventure Awaits">
        <span className="adventure-logo-plane" aria-hidden="true">✈</span>
        <span className="adventure-logo-adventure">Adventure</span>
        <span className="adventure-logo-awaits">Awaits</span>
      </div>
      <p className="setup-honorees">Celebrating <strong>Vishwa &amp; Ninad</strong></p>
      <p className="setup-subtitle">Boarding now for their greatest adventure yet</p>
      <form onSubmit={handleStartGame} className="setup-form">
        <h2>Passenger Check-In</h2>
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
