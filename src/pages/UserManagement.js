import React, { useState, useEffect } from 'react';
import { HiMagnifyingGlass, HiUserPlus, HiPencil, HiTrash, HiXMark } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Admin',
    status: 'Active',
  });

  // Mock data - replace with API call
  const mockUsers = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@kulobalhealth.com',
      phone: '+233 24 123 4567',
      role: 'Admin',
      status: 'Active',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@kulobalhealth.com',
      phone: '+233 24 234 5678',
      role: 'Manager',
      status: 'Active',
      createdAt: '2024-02-20',
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@kulobalhealth.com',
      phone: '+233 24 345 6789',
      role: 'Staff',
      status: 'Inactive',
      createdAt: '2024-03-10',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddUser = () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Add user (simulate API call)
    const newUser = {
      id: users.length + 1,
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers([...users, newUser]);
    toast.success('User added successfully');
    setShowAddModal(false);
    resetForm();
  };

  const handleEditUser = () => {
    // Update user (simulate API call)
    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id ? { ...user, ...formData } : user
    );

    setUsers(updatedUsers);
    toast.success('User updated successfully');
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      toast.success('User deleted successfully');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'Admin',
      status: 'Active',
    });
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>
        <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
          <HiUserPlus style={{ width: '18px', height: '18px' }} />
          <span>Add User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <HiMagnifyingGlass className="search-icon" />
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-field"
        />
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-results">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </div>
                        <span>
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                        >
                          <HiPencil />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete user"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <HiXMark />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleAddUser}>
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <HiXMark />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleEditUser}>
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
