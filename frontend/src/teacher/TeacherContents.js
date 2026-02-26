import React from 'react';

const TeacherContents = ({ user }) => {
  return (
    <div className="admin-card">
      <h3>Course Contents for {user.subject}</h3>
      <p>Here you will see a list of all the materials you have uploaded.</p>
      {/* We will add a table or list here later */}
    </div>
  );
};

export default TeacherContents;