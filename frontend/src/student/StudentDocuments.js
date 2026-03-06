import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentDocuments = ({ subjectName }) => {
    const [contentList, setContentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectName]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/contents/document?subject=${encodeURIComponent(subjectName)}`);
            setContentList(response.data);
        } catch (error) {
            console.error("Error fetching documents:", error);
            setContentList([]);
        }
        setLoading(false);
    };

    if (selectedItem) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <button onClick={() => setSelectedItem(null)} style={{ marginBottom: '20px', padding: '6px 12px', backgroundColor: '#bdc3c7', color: '#2c3e50', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Close Document
                </button>
                <h3 style={{ margin: '0 0 20px 0', color: '#34495e' }}>{selectedItem.title}</h3>
                <a href={selectedItem.documentUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#9b59b6', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', marginBottom: '20px' }}>
                    📄 Open Full Document
                </a>
                <h4>Reading Check Questions:</h4>
                {selectedItem.questions?.map((q, idx) => (
                    <div key={idx} style={{ backgroundColor: 'white', padding: '15px', marginBottom: '10px', borderLeft: '4px solid #9b59b6', borderRadius: '4px' }}>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Q: {q.question}</p>
                        <p style={{ margin: '0', color: '#7f8c8d' }}>A: {q.answer}</p>
                    </div>
                ))}
            </div>
        );
    }

    return loading ? <p>Loading Documents...</p> : contentList.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', textAlign: 'center', borderRadius: '4px', border: '1px dashed #ccc' }}><p style={{ color: '#7f8c8d' }}>No documents have been uploaded yet.</p></div>
    ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {contentList.map((item, index) => (
                <div key={index} onClick={() => setSelectedItem(item)} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', cursor: 'pointer' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{item.title}</h4>
                    <span style={{ fontSize: '24px' }}>📑</span>
                    <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#3498db', fontWeight: 'bold' }}>Click to read</p>
                </div>
            ))}
        </div>
    );
};

export default StudentDocuments;