import { useState, useEffect } from 'react';
import '../styles/Groups.css';

const API_URL = 'http://localhost:3001';

/**
 * Groups Component
 * Manages friend groups with food preferences.
 * @param {Object} props - Component props.
 * @param {Object} props.user - Current logged-in user.
 */
function Groups({ user }) {
    const [groups, setGroups] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        foodPreferences: []
    });

    const foodPreferenceOptions = ['Vegan', 'Vegetarian', 'Omnivore', 'Pescetarian'];

    /**
     * Fetches all groups for the current user.
     */
    const fetchGroups = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/groups?userId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch groups');
            const data = await response.json();
            setGroups(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetches all users for inviting to groups.
     */
    const fetchUsers = async () => {
        if (!user?.id) return;
        try {
            // Fetch friends instead of all users
            const response = await fetch(`${API_URL}/api/friends?userId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch friends');
            const data = await response.json();
            setAllUsers(data);
        } catch (err) {
            console.error('Error fetching friends:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchGroups();
            fetchUsers();
        }
    }, [user]);

    /**
     * Toggles food preference for new group.
     * @param {string} pref - Food preference to toggle.
     */
    const togglePreference = (pref) => {
        setNewGroup(prev => ({
            ...prev,
            foodPreferences: prev.foodPreferences.includes(pref)
                ? prev.foodPreferences.filter(p => p !== pref)
                : [...prev.foodPreferences, pref]
        }));
    };

    /**
     * Creates a new group.
     * @param {Event} e - Form submit event.
     */
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setError('');

        if (!newGroup.name.trim()) {
            setError('Group name is required');
            return;
        }

        try {
            // Convert foodPreferences array to comma-separated string
            const groupData = {
                name: newGroup.name,
                description: newGroup.description,
                foodPreferences: newGroup.foodPreferences.join(','),
                creatorId: user.id
            };

            const response = await fetch(`${API_URL}/api/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create group');
            }

            setNewGroup({ name: '', description: '', foodPreferences: [] });
            setShowCreateForm(false);
            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * Adds a member to a group.
     * @param {number} groupId - Group ID.
     * @param {number} userId - User ID to add.
     */
    const handleAddMember = async (groupId, userId) => {
        try {
            const response = await fetch(`${API_URL}/api/groups/${groupId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) throw new Error('Failed to add member');
            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * Removes a member from a group.
     * @param {number} groupId - Group ID.
     * @param {number} userId - User ID to remove.
     */
    const handleRemoveMember = async (groupId, userId) => {
        try {
            const response = await fetch(`${API_URL}/api/groups/${groupId}/members/${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to remove member');
            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * Deletes a group.
     * @param {number} groupId - Group ID.
     */
    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;

        try {
            const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete group');
            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    const [editingMember, setEditingMember] = useState(null);
    const [editLabels, setEditLabels] = useState('');

    /**
     * Updates member labels.
     */
    const handleUpdateLabels = async (groupId, userId) => {
        try {
            const response = await fetch(`${API_URL}/api/groups/${groupId}/members/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labels: editLabels })
            });

            if (!response.ok) throw new Error('Failed to update labels');

            // Reset state
            setEditingMember(null);
            setEditLabels('');
            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    const [addingMemberToGroupId, setAddingMemberToGroupId] = useState(null);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [memberLabels, setMemberLabels] = useState('');

    /**
     * Adds a member to a group with labels.
     */
    const handleAddMemberWithLabels = async (groupId) => {
        if (!selectedMemberId) return;

        try {
            const memberIdInt = parseInt(selectedMemberId);
            if (isNaN(memberIdInt)) throw new Error("Invalid User ID");

            const response = await fetch(`${API_URL}/api/groups/${groupId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: memberIdInt,
                    labels: memberLabels
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add member');
            }

            // Reset state
            setAddingMemberToGroupId(null);
            setSelectedMemberId('');
            setMemberLabels('');

            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h2>👥 Friend Groups</h2>
                <button
                    className="create-group-btn"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? '✕ Cancel' : '➕ Create Group'}
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <span>⚠️</span> {error}
                </div>
            )}

            {showCreateForm && (
                <div className="create-group-form">
                    <h3>Create New Group</h3>
                    <form onSubmit={handleCreateGroup}>
                        <div className="form-group">
                            <label>Group Name</label>
                            <input
                                type="text"
                                value={newGroup.name}
                                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                required
                                placeholder="e.g., Vegan Friends"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={newGroup.description}
                                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                placeholder="What's this group about?"
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Food Preferences</label>
                            <div className="preferences-grid">
                                {foodPreferenceOptions.map(pref => (
                                    <button
                                        key={pref}
                                        type="button"
                                        className={`preference-tag ${newGroup.foodPreferences.includes(pref) ? 'active' : ''}`}
                                        onClick={() => togglePreference(pref)}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">✨ Create Group</button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading groups...</p>
                </div>
            ) : groups.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">👥</span>
                    <h3>No groups yet</h3>
                    <p>Create your first group to start sharing with friends!</p>
                </div>
            ) : (
                <div className="groups-grid">
                    {groups.map(group => (
                        <div key={group.id} className="group-card">
                            <div className="group-header">
                                <h3>{group.name}</h3>
                                {group.creatorId === user.id && (
                                    <span className="creator-badge">👑 Owner</span>
                                )}
                            </div>

                            {group.description && (
                                <p className="group-description">{group.description}</p>
                            )}

                            {group.foodPreferences && group.foodPreferences.length > 0 && (
                                <div className="group-preferences">
                                    {group.foodPreferences.split(',').filter(p => p.trim()).map(pref => (
                                        <span key={pref} className="preference-badge">{pref.trim()}</span>
                                    ))}
                                </div>
                            )}

                            <div className="group-members">
                                <h4>Members ({group.members?.length || 0})</h4>
                                <div className="members-list">
                                    {group.members?.map(member => (
                                        <div key={member.id} className="member-item">
                                            <div className="member-info">
                                                <span className="member-name">
                                                    {member.username}
                                                    {member.id === group.creatorId && ' 👑'}
                                                </span>

                                                {/* Edit Mode */}
                                                {editingMember === member.id ? (
                                                    <div className="edit-labels-form">
                                                        <input
                                                            type="text"
                                                            value={editLabels}
                                                            onChange={(e) => setEditLabels(e.target.value)}
                                                            className="tiny-input"
                                                            placeholder="Custom labels..."
                                                            autoFocus
                                                        />
                                                        <div className="edit-actions">
                                                            <button onClick={() => handleUpdateLabels(group.id, member.id)}>💾</button>
                                                            <button onClick={() => setEditingMember(null)}>❌</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* View Mode */
                                                    /* View Mode */
                                                    <div className="labels-view">
                                                        <div className="member-labels">
                                                            {/* User Registered Preference */}
                                                            {member.foodPreferences && (
                                                                <span className="member-label-tag pref-label" title="User Registered Preference">
                                                                    {member.foodPreferences}
                                                                </span>
                                                            )}

                                                            {/* Admin Custom Labels */}
                                                            {member.GroupMember?.labels && member.GroupMember.labels.split(',').filter(l => l.trim()).map((label, idx) => (
                                                                <span key={idx} className="member-label-tag custom-label" title="Custom Group Label">
                                                                    {label.trim()}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {group.creatorId === user.id && (
                                                            <button
                                                                className="edit-icon-btn"
                                                                onClick={() => {
                                                                    setEditingMember(member.id);
                                                                    setEditLabels(member.GroupMember?.labels || '');
                                                                }}
                                                                title="Edit Custom Labels"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {group.creatorId === user.id && member.id !== user.id && (
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => handleRemoveMember(group.id, member.id)}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {group.creatorId === user.id && (
                                <div className="group-actions">
                                    {addingMemberToGroupId === group.id ? (
                                        <div className="add-member-form">
                                            <select
                                                value={selectedMemberId}
                                                onChange={(e) => setSelectedMemberId(e.target.value)}
                                                className="add-member-select"
                                            >
                                                <option value="">Select Friend...</option>
                                                {allUsers
                                                    .filter(u => !group.members?.some(m => m.id === u.id))
                                                    .map(u => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.username}
                                                        </option>
                                                    ))}
                                            </select>

                                            <div className="labels-input-container">
                                                <input
                                                    type="text"
                                                    placeholder="Custom Custom labels (e.g. Needs Ride, Allergies)"
                                                    value={memberLabels}
                                                    onChange={(e) => setMemberLabels(e.target.value)}
                                                    className="labels-input"
                                                />
                                            </div>

                                            <div className="add-member-actions">
                                                <button
                                                    className="confirm-add-btn"
                                                    onClick={() => handleAddMemberWithLabels(group.id)}
                                                    disabled={!selectedMemberId}
                                                >
                                                    Add Member
                                                </button>
                                                <button
                                                    className="cancel-add-btn"
                                                    onClick={() => {
                                                        setAddingMemberToGroupId(null);
                                                        setSelectedMemberId('');
                                                        setMemberLabels('');
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="invoke-add-btn"
                                            onClick={() => setAddingMemberToGroupId(group.id)}
                                        >
                                            ➕ Invite Friend
                                        </button>
                                    )}

                                    <button
                                        className="delete-group-btn"
                                        onClick={() => handleDeleteGroup(group.id)}
                                    >
                                        🗑️ Delete Group
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Groups;
