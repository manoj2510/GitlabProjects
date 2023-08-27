import React, { useState } from "react";
import axios from "axios";
import * as d3 from "d3";
import "./ProjectsandCommit.css";
import BarGraph from "./BarGraph";

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
      const commits = response.data;

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
      // const formattedCommits = response.data.map((commit) => ({
      //   ...commit,
      //   committed_date: new Date(commit.committed_date).toLocaleDateString(),
      // }));
      // setProjectCommits(formattedCommits);

      // // D3.js code to create the contribution chart
      // const svgWidth = 400;
      // const svgHeight = 300;
      // const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      // const width = svgWidth - margin.left - margin.right;
      // const height = svgHeight - margin.top - margin.bottom;

      // const svg = d3
      //   .select("#contribution-chart-container")
      //   .append("svg")
      //   .attr("width", svgWidth)
      //   .attr("height", svgHeight);

      // const xScale = d3
      //   .scaleBand()
      //   .domain(formattedCommits.map((commit) => commit.author_name))
      //   .range([margin.left, width - margin.right])
      //   .padding(0.1);

      // const yScale = d3
      //   .scaleLinear()
      //   .domain([0, d3.max(formattedCommits, (commit) => commit.commits)])
      //   .nice()
      //   .range([height - margin.bottom, margin.top]);

      // svg
      //   .selectAll("rect")
      //   .data(formattedCommits)
      //   .enter()
      //   .append("rect")
      //   .attr("x", (commit) => xScale(commit.author_name))
      //   .attr("y", (commit) => yScale(commit.commits))
      //   .attr("width", xScale.bandwidth())
      //   .attr(
      //     "height",
      //     (commit) => height - margin.bottom - yScale(commit.commits)
      //   )
      //   .attr("fill", "steelblue");

      // svg
      //   .append("g")
      //   .attr("transform", `translate(0, ${height - margin.bottom})`)
      //   .call(d3.axisBottom(xScale));

      // svg
      //   .append("g")
      //   .attr("transform", `translate(${margin.left}, 0)`)
      //   .call(d3.axisLeft(yScale));
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
            {/* Add a container for the contribution chart */}
            <div id="contribution-chart-container"></div>
            <BarGraph data={projectCommits} width={500} height={600} />
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
