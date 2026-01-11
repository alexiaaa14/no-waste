import { useState, useEffect } from 'react';
import '../styles/ShareProductModal.css';

const API_URL = 'http://localhost:3001';

/**
 * Modal to select advanced sharing options for a product.
 * @param {Object} props
 * @param {Object} props.user - The current user.
 * @param {Object} props.product - The product being shared.
 * @param {Function} props.onConfirm - Callback when sharing is confirmed (settings).
 * @param {Function} props.onClose - Callback to close modal.
 */
function ShareProductModal({ user, product, onConfirm, onClose }) {
    const [visibility, setVisibility] = useState('public');
    const [myGroups, setMyGroups] = useState([]);
    const [myFriends, setMyFriends] = useState([]);

    const [selectedGroups, setSelectedGroups] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initialize state from existing product settings
        if (product) {
            setVisibility(product.visibility || 'public');

            let sharedData = { groupIds: [], userIds: [] };
            if (product.sharedWith) {
                try {
                    // Check if it's already an object (from frontend prop) or string (from DB)
                    sharedData = typeof product.sharedWith === 'string'
                        ? JSON.parse(product.sharedWith)
                        : product.sharedWith;
                } catch (e) {
                    console.error("Error parsing sharedWith:", e);
                }
            }
            setSelectedGroups(sharedData.groupIds || []);
            setSelectedFriends(sharedData.userIds || []);
        }

        // Fetch groups and friends
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                // Fetch groups
                const groupsRes = await fetch(`${API_URL}/api/groups?userId=${user.id}`);
                if (groupsRes.ok) setMyGroups(await groupsRes.json());

                // Fetch friends
                const friendsRes = await fetch(`${API_URL}/api/friends?userId=${user.id}`);
                if (friendsRes.ok) setMyFriends(await friendsRes.json());
            } catch (err) {
                console.error("Error loading share data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, product]);

    const handleConfirm = () => {
        const settings = {
            visibility,
            sharedWith: {
                groupIds: visibility === 'groups' ? selectedGroups : [],
                userIds: visibility === 'specific' ? selectedFriends : []
            }
        };
        onConfirm(settings);
    };

    const toggleGroup = (id) => {
        setSelectedGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const toggleFriend = (id) => {
        setSelectedFriends(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <div className="share-modal-overlay">
            <div className="share-modal">
                <div className="modal-header">
                    <h3>📢 Share "{product.name}"</h3>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="modal-body">
                    <p className="subtitle">Who can see this product?</p>

                    <div className="visibility-options">
                        <label className={`option-card ${visibility === 'public' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="visibility"
                                value="public"
                                checked={visibility === 'public'}
                                onChange={(e) => setVisibility(e.target.value)}
                            />
                            <span className="icon">🌍</span>
                            <div className="option-text">
                                <strong>Public / Marketplace</strong>
                                <small>Visible to everyone (legacy mode)</small>
                            </div>
                        </label>

                        <label className={`option-card ${visibility === 'friends' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="visibility"
                                value="friends"
                                checked={visibility === 'friends'}
                                onChange={(e) => setVisibility(e.target.value)}
                            />
                            <span className="icon">🤗</span>
                            <div className="option-text">
                                <strong>All Friends</strong>
                                <small>Visible to all your confirmed friends</small>
                            </div>
                        </label>

                        <label className={`option-card ${visibility === 'groups' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="visibility"
                                value="groups"
                                checked={visibility === 'groups'}
                                onChange={(e) => setVisibility(e.target.value)}
                            />
                            <span className="icon">👥</span>
                            <div className="option-text">
                                <strong>Specific Groups</strong>
                                <small>Select groups to share with</small>
                            </div>
                        </label>

                        {visibility === 'groups' && (
                            <div className="selection-list">
                                {myGroups.length === 0 ? <p className="empty-msg">No groups found.</p> :
                                    myGroups.map(g => (
                                        <label key={g.id} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedGroups.includes(g.id)}
                                                onChange={() => toggleGroup(g.id)}
                                            />
                                            {g.name}
                                        </label>
                                    ))}
                            </div>
                        )}

                        <label className={`option-card ${visibility === 'specific' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="visibility"
                                value="specific"
                                checked={visibility === 'specific'}
                                onChange={(e) => setVisibility(e.target.value)}
                            />
                            <span className="icon">👤</span>
                            <div className="option-text">
                                <strong>Specific Friends</strong>
                                <small>Select individual friends</small>
                            </div>
                        </label>

                        {visibility === 'specific' && (
                            <div className="selection-list">
                                {myFriends.length === 0 ? <p className="empty-msg">No friends found.</p> :
                                    myFriends.map(f => (
                                        <label key={f.id} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedFriends.includes(f.id)}
                                                onChange={() => toggleFriend(f.id)}
                                            />
                                            {f.username}
                                        </label>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleConfirm} className="confirm-btn">🚀 Share / Save</button>
                </div>
            </div>
        </div>
    );
}

export default ShareProductModal;
