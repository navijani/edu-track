import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherContents = ({ user }) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // NEW: State to track which tile the user clicked on
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch data whenever the active tab changes
  useEffect(() => {
    setSelectedItem(null); // Close the detail view if they switch tabs
    fetchContent(activeTab);
  }, [activeTab]);

  const fetchContent = async (type) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/contents/${type}?teacherId=${user.id}`);
      setContentList(response.data);
    } catch (error) {
      console.error("Error fetching content:", error);
      setContentList([]);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    // Built-in browser confirmation popup
    if (!window.confirm(`Are you sure you want to completely delete this ${activeTab.slice(0, -1)}? This cannot be undone.`)) return;

    try {
      // Send the DELETE request to the current active tab's endpoint
      await axios.delete(`http://localhost:8080/api/contents/${activeTab.slice(0, -1)}?id=${selectedItem.id}`);

      // Close the detail view and refresh the list!
      setSelectedItem(null);
      fetchContent(activeTab);
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete the content. Make sure the Java server is running.");
    }
  };

  // Helper to extract YouTube ID for the live preview in Detail View
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className="admin-card" style={{ marginTop: '20px' }}>

      {/*  DETAILED VIEW (Shows when a tile is clicked)  */}
      {selectedItem ? (
        <div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <button
              onClick={() => setSelectedItem(null)}
              style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              ⬅ Back to {activeTab}
            </button>

            <button
              onClick={handleDelete}
              style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              🗑️ Delete Completely
            </button>
          </div>

          <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>{selectedItem.title}</h3>

          {/* Video Detail specific layout */}
          {activeTab === 'videos' && (
            <div>
              {/* Show Video Player */}
              <div style={{ marginBottom: '20px' }}>
                <iframe
                  width="100%" height="400"
                  src={getYouTubeEmbedUrl(selectedItem.videoUrl)}
                  title="YouTube video player" frameBorder="0" allowFullScreen>
                </iframe>
              </div>

              {/* Show Associated Questions */}
              <h4>Associated Questions ({selectedItem.questions?.length || 0})</h4>
              {selectedItem.questions && selectedItem.questions.map((q, idx) => (
                <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '15px', marginBottom: '10px', borderLeft: '4px solid #3498db', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Q{idx + 1}: {q.question}</p>
                  <p style={{ margin: '0', color: '#27ae60' }}><strong>Answer:</strong> {q.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/*  QUIZ DETAILED VIEW  */}
          {activeTab === 'quizzes' && (
            <div>
              {/* Quiz Metadata Bar */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', backgroundColor: '#fcf3cf', borderLeft: '4px solid #f39c12', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}><strong>Duration:</strong> {selectedItem.duration} mins</p>
                <p style={{ margin: 0 }}><strong>Total Marks:</strong> {selectedItem.marks}</p>
                <p style={{ margin: 0 }}><strong>Scheduled For:</strong> {new Date(selectedItem.scheduledDate).toLocaleString()}</p>
              </div>

              {/* Show Associated Quiz Questions */}
              <h4>Quiz Questions ({selectedItem.questions?.length || 0})</h4>

              {selectedItem.questions && selectedItem.questions.map((q, idx) => (
                <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '15px', marginBottom: '15px', borderLeft: '4px solid #f39c12', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '15px' }}>Q{idx + 1}: {q.question}</p>

                  {/* Show Image if it exists */}
                  {q.imageUrl && q.imageUrl.trim() !== '' && (
                    <div style={{ marginBottom: '10px' }}>
                      <img src={q.imageUrl} alt="Question Graphic" style={{ maxHeight: '120px', borderRadius: '4px' }} />
                    </div>
                  )}

                  {/* Render the dynamic options array */}
                  <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px', listStyleType: 'circle' }}>
                    {q.options && q.options.map((opt, oIdx) => (
                      <li
                        key={oIdx}
                        style={{
                          color: opt === q.correctAnswer ? '#27ae60' : '#34495e',
                          fontWeight: opt === q.correctAnswer ? 'bold' : 'normal',
                          marginBottom: '4px'
                        }}
                      >
                        {opt} {opt === q.correctAnswer && " ✔️ (Correct)"}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/*  DOCUMENT DETAILED VIEW  */}
          {activeTab === 'documents' && (
            <div>
              {/* Document Link Button */}
              <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f4f6f7', borderRadius: '8px', textAlign: 'center', border: '1px dashed #bdc3c7' }}>
                <p style={{ margin: '0 0 15px 0', color: '#7f8c8d' }}>This document is hosted externally (e.g., Google Drive, OneDrive).</p>
                <a
                  href={selectedItem.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '10px 20px', backgroundColor: '#9b59b6', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}
                >
                  📄 Open Document in New Tab
                </a>
              </div>

              {/* Show Associated Reading Questions */}
              <h4>Reading Comprehension Questions ({selectedItem.questions?.length || 0})</h4>

              {selectedItem.questions && selectedItem.questions.length > 0 ? (
                selectedItem.questions.map((q, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '15px', marginBottom: '10px', borderLeft: '4px solid #9b59b6', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Q{idx + 1}: {q.question}</p>
                    <p style={{ margin: '0', color: '#8e44ad' }}><strong>Expected Answer:</strong> {q.answer}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No reading questions were attached to this document.</p>
              )}
            </div>
          )}


        </div>

      ) : (

        /*  GRID VIEW (Shows by default) ---*/
        <div>
          <h3>Manage Uploaded Contents for {user.subject}</h3>

          {/* Content Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            <button onClick={() => setActiveTab('videos')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'videos' ? '#e74c3c' : '#ecf0f1', color: activeTab === 'videos' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🎥 Videos</button>
            <button onClick={() => setActiveTab('quizzes')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'quizzes' ? '#f39c12' : '#ecf0f1', color: activeTab === 'quizzes' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📝 Quizzes</button>
            <button onClick={() => setActiveTab('documents')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'documents' ? '#9b59b6' : '#ecf0f1', color: activeTab === 'documents' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📄 Documents</button>
          </div>

          {loading ? (
            <p>Loading your materials...</p>
          ) : contentList.length === 0 ? (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', textAlign: 'center', borderRadius: '4px' }}>
              <p style={{ color: '#7f8c8d' }}>You haven't uploaded any {activeTab} yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>

              {/* Map through the items and make them clickable */}
              {contentList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedItem(item)} // Clicking sets the Detail View!
                  style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{item.title}</h4>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#7f8c8d' }}><strong>Subject:</strong> {item.subject}</p>

                  {activeTab === 'videos' && (
                    <p style={{ margin: '0', fontSize: '12px', color: '#3498db', fontWeight: 'bold' }}>Click to view {item.questions?.length || 0} Questions</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherContents;