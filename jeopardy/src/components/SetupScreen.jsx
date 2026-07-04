import { useState } from 'react';
import '../styles/App.css';

function SetupScreen({ onStart }) {
  const [groupNames, setGroupNames] = useState(['', '', '', '']);

  const handleChange = (index, value) => {
    const updated = [...groupNames];
    updated[index] = value;
    setGroupNames(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const names = groupNames.map((name, i) => name.trim() || `Group ${i + 1}`);
    onStart(names);
  };

  return (
    <div className="setup-screen">
      <h1 className="setup-title">JEOPARDY!</h1>
      <form onSubmit={handleSubmit} className="setup-form">
        <h2>Enter Group Names</h2>
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
        <button type="submit" className="start-button">
          Start Game
        </button>
      </form>
    </div>
  );
}

export default SetupScreen;
