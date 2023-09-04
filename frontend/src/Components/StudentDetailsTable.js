import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentDetailsTable.css";

function StudentDetailsTable({ projectId }) {
  const [studentDetails, setStudentDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch student details
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`/api/student-details/${projectId}`);
        const details = response.data.map((commit) => ({
          ...commit,
          firstCommitDate: new Date(
            commit.firstCommitDate
          ).toLocaleDateString(),
          lastCommitDate: new Date(commit.lastCommitDate).toLocaleDateString(),
        }));
        setStudentDetails(details);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student details:", error);
        setLoading(false);
      }
    };

    // Call the fetchStudentDetails function
    fetchStudentDetails();
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="details-container">
      <h2>Student Details for Project {projectId}</h2>
      <table className="student-details-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Commits</th>
            <th>First Commit Date</th>
            <th>Last Commit Date</th>
          </tr>
        </thead>
        <tbody>
          {studentDetails.map((student) => (
            <tr key={student.name}>
              <td>{student.name}</td>
              <td>{student.totalCommits}</td>
              <td>{student.firstCommitDate}</td>
              <td>{student.lastCommitDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentDetailsTable;
