// index.js

const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 6000;

app.use(express.json());

const gitlabApiBaseUrl = "https://git.cardiff.ac.uk/api/v4";

app.get("/api/projects", async (req, res) => {
  try {
    const token = req.query.token || ""; // Get token from query parameter
    const date = req.query.date || "";

    let url = `${gitlabApiBaseUrl}/projects?membership=true`;

    const response = await axios.get(url, {
      headers: {
        "PRIVATE-TOKEN": token,
      },
    });

    let projects = response.data;

    // If a date is provided, filter projects based on created_at date
    if (date) {
      projects = projects.filter((project) => {
        const createdAt = new Date(project.created_at);
        const filterDate = new Date(date);
        return createdAt >= filterDate;
      });
    }
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Error fetching projects" });
  }
});

//API call to retrieve the details of total commits in the project. to represent the contribution in bargraph
app.get("/api/commits/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const response = await axios.get(
      `${gitlabApiBaseUrl}/projects/${projectId}/repository/commits`,
      {
        headers: {
          "PRIVATE-TOKEN": "oY6duDBV4C6sEWxTS5Ei",
        },
      }
    );

    const commits = response.data;
    res.json(commits);
  } catch (error) {
    console.error("Error fetching commits:", error);
    res.status(500).json({ error: "Error fetching commits" });
  }
});

// API to retrieve the student details for each project. To record contribution
app.get("/api/student-details/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Fetch commits for the project
    const commitsResponse = await axios.get(
      `${gitlabApiBaseUrl}/projects/${projectId}/repository/commits`,
      {
        headers: {
          "PRIVATE-TOKEN": "oY6duDBV4C6sEWxTS5Ei",
        },
      }
    );

    const commits = commitsResponse.data;

    // Process commits to get student details
    const studentDetails = {};

    commits.forEach((commit) => {
      const authorName = commit.author_name;

      // Initialize author if doesn't exist
      if (!studentDetails[authorName]) {
        studentDetails[authorName] = {
          name: authorName,
          totalCommits: 0,
          firstCommitDate: null,
          lastCommitDate: null,
        };
      }

      // Increment total commits
      studentDetails[authorName].totalCommits++;

      // Update date range
      const committedDate = new Date(commit.created_at);
      if (
        !studentDetails[authorName].firstCommitDate ||
        committedDate < studentDetails[authorName].firstCommitDate
      ) {
        studentDetails[authorName].firstCommitDate = committedDate;
      }

      if (
        !studentDetails[authorName].lastCommitDate ||
        committedDate > studentDetails[authorName].lastCommitDate
      ) {
        studentDetails[authorName].lastCommitDate = committedDate;
      }
    });

    // Convert to array
    const studentDetailsArray = Object.values(studentDetails);
    res.json(studentDetailsArray);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ error: "Error fetching student details" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
