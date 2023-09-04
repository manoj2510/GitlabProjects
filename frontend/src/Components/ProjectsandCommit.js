import React, { useState } from "react";
import axios from "axios";
import * as d3 from "d3";
import "./ProjectsandCommit.css";
import BarGraph from "./BarGraph";
import DownloadButton from "./DownloadButton";
import StudentDetailsTable from "./StudentDetailsTable";

function ProjectsAndCommits() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
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
  const [commitState, setCommitState] = useState([]);

  const openModal = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(project);
    try {
      const response = await axios.get(`/api/commits/${projectId}`);
      const commits = response.data;

      const commitDetails = response.data.map((commit) => ({
        ...commit,
        committed_date: new Date(commit.committed_date).toLocaleDateString(),
      }));

      setCommitState(commitDetails);

      // Group commits by author name and count the number of commits for each author
      const authorCommitCounts = {};
      commits.forEach((commit) => {
        const author = commit.author_name;
        authorCommitCounts[author] = (authorCommitCounts[author] || 0) + 1;
      });

      // Format the data for the bar chart
      const formattedData = Object.keys(authorCommitCounts).map((author) => ({
        author_name: author,
        commit_frequency: authorCommitCounts[author],
      }));

      setProjectCommits(formattedData);
    } catch (error) {
      console.error("Error fetching commits:", error);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  return (
    <div className="ProjectList">
      <h2 style={{ color: "white" }}>Projects</h2>
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
            {/* Add a container for the contribution chart */}
            <div id="contribution-chart-container" className="graph-container">
              <BarGraph data={projectCommits} width={400} height={300} />
            </div>

            <table className="commit-table">
              <thead>
                <tr>
                  <th>Commit Author</th>
                  <th>Commit Date</th>
                  <th>Commit Message</th>
                </tr>
              </thead>
              <tbody>
                {commitState.map((commit) => (
                  <tr key={commit.id}>
                    <td>{commit.author_name}</td>
                    <td>{commit.committed_date}</td>
                    <td>{commit.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <StudentDetailsTable projectId={selectedProject.id} />

            {/* Use the DownloadButton component and pass the projectId */}
            <DownloadButton
              projectId={selectedProject.id}
              projectName={selectedProject.name}
            />

            {/* <ul>
              {projectCommits.map((commit) => (
                <li key={commit.id}>
                  <div className="commit-details">
                    <div className="commit-header">
                      <strong className="project-description">
                        {commit.author_name}: {commit.committed_date}
                      </strong>
                    </div>
                    <p className="commit-message">{commit.message}</p>
                  </div>
                </li>
              ))}
            </ul> */}
            {/* <span className="project-created-date">
              Created: {selectedProject.created_at}
            </span> */}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsAndCommits;
