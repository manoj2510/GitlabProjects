// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [commits, setCommits] = useState([]);
  const [token, setToken] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [fetching, setFetching] = useState(false);

  const handleFetchProjects = () => {
    setFetching(true);
    let apiUrl = `/api/projects?token=${token}`;
    if (selectedDate) {
      apiUrl += `&date=${selectedDate}`;
    }
    axios.get(apiUrl)
      .then(response => {
        setProjects(response.data);
        setFetching(false);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
        setFetching(false);
      });
  };

  const handleProjectSelect = async (projectId) => {
    setSelectedProject(projectId);
    try {
      const response = await axios.get(`/api/commits/${projectId}`);
      setCommits(response.data);
    } catch (error) {
      console.error('Error fetching commits:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GitLab Projects and Commits</h1>
        <div className="input-fields">
          <label>
            Personal Access Token:
            <input type="text" value={token} onChange={(e) => setToken(e.target.value)} />
          </label>
          <label>
            Filter Projects Created On or After:
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </label>
          <button onClick={handleFetchProjects} disabled={fetching}>
            {fetching ? 'Fetching...' : 'Fetch Projects'}
          </button>
        </div>
        <div className="project-list">
          <h2>Projects</h2>
          <ul>
            {projects.map(project => (
              <li key={project.id} onClick={() => handleProjectSelect(project.id)}>
                {project.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="commit-list">
          <h2>Commits</h2>
          <ul>
            {commits.map(commit => (
              <li key={commit.id}>
                <strong>{commit.author_name}:</strong> {commit.message}
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
