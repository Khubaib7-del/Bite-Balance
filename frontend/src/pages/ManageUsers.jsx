import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Trash2, Edit, Shield } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Admin.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await adminService.getUsers();
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch users', err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminService.deleteUser(id);
                fetchUsers();
            } catch (err) {
                console.error('Failed to delete user', err);
            }
        }
    };

    const filteredUsers = users.filter(user => 
        user.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-black mb-1">User Management</h1>
                    <p className="text-muted small">Monitor and manage all system users and their roles.</p>
                </div>
                <button className="btn bb-grad-green text-white rounded-pill px-4 d-flex align-items-center gap-2">
                    <UserPlus size={18} /> Add New User
                </button>
            </div>

            <div className="bb-chart-card mb-4">
                <div className="d-flex gap-3 mb-4">
                    <div className="flex-grow-1 position-relative">
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input 
                            type="text" 
                            className="form-control rounded-pill ps-5 border-0 bg-light" 
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr className="text-muted extra-small text-uppercase fw-black border-bottom">
                                <th className="border-0">User</th>
                                <th className="border-0">Role</th>
                                <th className="border-0">Joined Date</th>
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-5">Loading users...</td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.UserID}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                                    <Users size={20} className="text-primary" />
                                                </div>
                                                <div>
                                                    <p className="fw-bold mb-0 text-dark">{user.Username}</p>
                                                    <p className="extra-small text-muted mb-0">{user.Email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${user.Role === 'ADMIN' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                                {user.Role === 'ADMIN' ? <Shield size={12} className="me-1" /> : null}
                                                {user.Role}
                                            </span>
                                        </td>
                                        <td className="small text-muted">
                                            {new Date(user.CreatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm btn-light rounded-circle p-2">
                                                    <Edit size={16} className="text-primary" />
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-light rounded-circle p-2"
                                                    onClick={() => handleDelete(user.UserID)}
                                                >
                                                    <Trash2 size={16} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">No users found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
