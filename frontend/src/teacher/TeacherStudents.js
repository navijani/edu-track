import React from 'react';

const TeacherStudents = ({ user }) => {
  return (
    <div className="admin-card">
      <h3>My Enrolled Students</h3>
      <p>List of students currently enrolled in {user.subject}.</p>
      {/* We will fetch and display students from the database here */}
    </div>
  );
};

export default TeacherStudents;