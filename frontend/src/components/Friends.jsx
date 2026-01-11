import { useState, useEffect } from 'react';
import '../styles/Friends.css';

const API_URL = 'http://localhost:3001';

function Friends({ user }) {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState({ sent: [], received: [] });
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'find', 'requests'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (activeTab === 'list') fetchFriends();
        if (activeTab === 'requests') fetchRequests();
    }, [activeTab, user.id]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/friends?userId=${user.id}`);
            if (!res.ok) throw new Error('Failed to fetch friends');
            setFriends(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/friends/requests?userId=${user.id}`);
            if (!res.ok) throw new Error('Failed to fetch requests');
            setRequests(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/users/search?q=${searchQuery}&excludeId=${user.id}`);
            if (!res.ok) throw new Error('Search failed');
            setSearchResults(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (addresseeId) => {
        try {
            const res = await fetch(`${API_URL}/api/friends/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterId: user.id, addresseeId })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send request');
            }
            alert('Request sent!');
            // Update UI state if necessary (e.g., mark as sent)
            setSearchResults(prev => prev.filter(u => u.id !== addresseeId));
        } catch (err) {
            alert(err.message);
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            const res = await fetch(`${API_URL}/api/friends/${requestId}/accept`, { method: 'PUT' });
            if (!res.ok) throw new Error('Failed to accept');
            fetchRequests(); // refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            const res = await fetch(`${API_URL}/api/friends/${requestId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to reject');
            fetchRequests();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="friends-container">
            <div className="friends-header">
                <h2>🤗 Friends & Community</h2>
                <div className="friends-nav">
                    <button
                        className={activeTab === 'list' ? 'active' : ''}
                        onClick={() => setActiveTab('list')}>
                        My Friends ({friends.length})
                    </button>
                    <button
                        className={activeTab === 'requests' ? 'active' : ''}
                        onClick={() => setActiveTab('requests')}>
                        Requests ({requests.received.length})
                    </button>
                    <button
                        className={activeTab === 'find' ? 'active' : ''}
                        onClick={() => setActiveTab('find')}>
                        Find People
                    </button>
                </div>
            </div>

            {error && <div className="error-banner">⚠️ {error}</div>}

            {activeTab === 'list' && (
                <div className="friends-grid">
                    {loading ? <div className="spinner"></div> : friends.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">😢</span>
                            <h3>No friends yet</h3>
                            <p>Go to "Find People" to connect with others!</p>
                        </div>
                    ) : (
                        friends.map(friend => (
                            <div key={friend.id} className="friend-card">
                                <div className="friend-avatar">👤</div>
                                <div className="friend-info">
                                    <h3>{friend.username}</h3>
                                    <p>{friend.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="requests-section">
                    <h3>Received Requests</h3>
                    {loading ? <div className="spinner"></div> : requests.received.length === 0 ? (
                        <p className="no-data">No pending requests.</p>
                    ) : (
                        <div className="requests-list">
                            {requests.received.map(req => (
                                <div key={req.id} className="request-card">
                                    <span><strong>{req.requester.username}</strong> wants to be friends.</span>
                                    <div className="actions">
                                        <button className="accept-btn" onClick={() => acceptRequest(req.id)}>Accept</button>
                                        <button className="reject-btn" onClick={() => rejectRequest(req.id)}>Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h3>Sent Requests</h3>
                    {requests.sent.length === 0 ? <p className="no-data">No sent requests.</p> : (
                        <div className="requests-list">
                            {requests.sent.map(req => (
                                <div key={req.id} className="request-card">
                                    <span>Sent to <strong>{req.addressee.username}</strong></span>
                                    <button className="reject-btn" onClick={() => rejectRequest(req.id)}>Cancel</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'find' && (
                <div className="find-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button type="submit">Search</button>
                    </form>

                    {loading ? <div className="spinner"></div> : (
                        <div className="search-results">
                            {searchResults.map(u => (
                                <div key={u.id} className="user-result-card">
                                    <span>{u.username}</span>
                                    <button onClick={() => sendRequest(u.id)}>Add Friend</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Friends;
