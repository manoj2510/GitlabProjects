import React, { useState } from "react";
import axios from "axios";

function DownloadButton({ projectId, projectName }) {
  const [loading, setLoading] = useState(false);

  const handleDownloadCSV = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`/api/commits/${projectId}`);
      const commitDetails = response.data.map((commit) => ({
        ...commit,
        committed_date: new Date(commit.committed_date).toLocaleDateString(),
      }));

      const csvData = commitDetails.map((commit) => {
        const author = commit.author_name.replace(/"/g, '""'); // Escape double quotes
        const message = commit.message.replace(/"/g, '""'); // Escape double quotes

        return `"${author}", "${commit.committed_date}", "${message}"`;
      });

      const csvContent = ["Author, Date, Message", ...csvData].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = projectName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error fetching commits:", error);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleDownloadCSV}
      disabled={loading}
      className="download-button"
    >
      {loading ? "Downloading..." : "Download CSV"}
    </button>
  );
}

export default DownloadButton;
