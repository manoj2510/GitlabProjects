import React, { useState } from "react";
import axios from "axios";
import "./ProjectsandCommit.css";

function ProjectsAndCommits() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [commits, setCommits] = useState([]);
  const [token, setToken] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [fetching, setFetching] = useState(false);

  const handleFetchProjects = () => {
    setFetching(true);
    let apiUrl = `/api/projects?token=${token}`;
    if (selectedDate) {
      apiUrl += `&date=${selectedDate}`;
    }
    axios
      .get(apiUrl)
      .then((response) => {
        setProjects(response.data);
        setFetching(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setFetching(false);
      });
  };

  const handleProjectSelect = async (projectId) => {
    setSelectedProject(projectId);
  };

  return (
    <div className="container">
      <h1 className="title">GitLab Projects and Commits</h1>
      <div className="input-fields">
        <label>
          Personal Access Token:
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
        <label>
          Filter Projects Created On or After:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
        <button onClick={handleFetchProjects} disabled={fetching}>
          {fetching ? "Fetching..." : "Fetch Projects"}
        </button>
      </div>
      <ProjectList
        projects={projects}
        handleProjectSelect={handleProjectSelect}
      />
    </div>
  );
}

function ProjectList({ projects, handleProjectSelect }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectCommits, setProjectCommits] = useState([]);

  const openModal = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(project);
    try {
      const response = await axios.get(`/api/commits/${projectId}`);
      const formattedCommits = response.data.map((commit) => ({
        ...commit,
        committed_date: new Date(commit.committed_date).toLocaleDateString(),
      }));
      setProjectCommits(formattedCommits);
    } catch (error) {
      console.error("Error fetching commits:", error);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  return (
    <div className="ProjectList">
      <h2 className="project-list-heading">Projects</h2>
      <div className="project-cards-container">
        {projects.map((project) => (
          <div
            className="project-card"
            key={project.id}
            onClick={() => openModal(project.id)}
          >
            <h3 className="project-name">{project.id}</h3>
            <h3 className="project-name">{project.name}</h3>
            <p className="project-description">{project.description}</p>
            <span className="project-created-date">
              Created: {project.created_at}
            </span>
          </div>
        ))}
      </div>
      {selectedProject && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>
              &times;
            </span>
            <h3 className="project-name">{selectedProject.name}</h3>
            <ul>
              {projectCommits.map((commit) => (
                <li key={commit.id}>
                  <strong className="project-description">
                    {commit.author_name}:{commit.committed_date}
                  </strong>
                </li>
              ))}
            </ul>
            <span className="project-created-date">
              Created: {selectedProject.created_at}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsAndCommits;
