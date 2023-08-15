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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
