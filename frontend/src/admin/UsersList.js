import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // URL MUST match your Main.java: server.createContext("/api/users", new UserHandler());
            const response = await axios.get('http://localhost:8080/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:8080/api/users?id=${id}`);
                fetchUsers(); // Refresh list
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loader">Loading Users...</div>;

    return (
        <div className="users-list-container">
            <div className="table-controls">
                <div className="search-bar">
                    <span>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by name, ID, or role..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="user-count">Showing {filteredUsers.length} of {users.length} users</div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>USER ID</th>
                        <th>FULL NAME</th>
                        <th>ROLE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                                <td>
                                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-data">No users found matching "{searchTerm}"</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UsersList;