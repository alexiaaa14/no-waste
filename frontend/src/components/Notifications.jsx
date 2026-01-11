import { useState, useEffect } from 'react';
import '../styles/Notifications.css';

const API_URL = 'http://localhost:3001';

/**
 * Notifications Component
 * Displays notifications for expiring products.
 * @param {Object} props - Component props.
 * @param {Object} props.user - Current logged-in user.
 */
function Notifications({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    /**
     * Fetches notifications for expiring products.
     */
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/notifications?userId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh notifications every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user.id]);

    /**
     * Gets notification icon based on urgency.
     * @param {number} daysLeft - Days until expiration.
     * @returns {string} Icon emoji.
     */
    const getNotificationIcon = (daysLeft) => {
        if (daysLeft === 0) return '🚨';
        if (daysLeft === 1) return '⚠️';
        return '⏰';
    };

    /**
     * Gets notification class based on urgency.
     * @param {number} daysLeft - Days until expiration.
     * @returns {string} CSS class name.
     */
    const getNotificationClass = (daysLeft) => {
        if (daysLeft === 0) return 'critical';
        if (daysLeft === 1) return 'urgent';
        return 'warning';
    };

    const unreadCount = notifications.length;

    return (
        <>
            <button
                className={`notifications-btn ${unreadCount > 0 ? 'has-notifications' : ''}`}
                onClick={() => setShowPanel(!showPanel)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {showPanel && (
                <div className="notifications-panel">
                    <div className="panel-header">
                        <h3>🔔 Notifications</h3>
                        <button className="close-btn" onClick={() => setShowPanel(false)}>
                            ✕
                        </button>
                    </div>

                    <div className="panel-content">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">✅</span>
                                <h4>All caught up!</h4>
                                <p>No expiring products at the moment.</p>
                            </div>
                        ) : (
                            <div className="notifications-list">
                                {notifications.map((notification, index) => {
                                    const daysLeft = Math.ceil(
                                        (new Date(notification.product.expirationDate) - new Date()) /
                                        (1000 * 60 * 60 * 24)
                                    );

                                    return (
                                        <div
                                            key={index}
                                            className={`notification-item ${getNotificationClass(daysLeft)}`}
                                        >
                                            <span className="notification-icon">
                                                {getNotificationIcon(daysLeft)}
                                            </span>
                                            <div className="notification-content">
                                                <p className="notification-message">
                                                    <strong>{notification.product.name}</strong> expires in{' '}
                                                    <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>!
                                                </p>
                                                <p className="notification-details">
                                                    {notification.product.category} • {notification.product.expirationDate}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="panel-footer">
                        <button className="refresh-btn" onClick={fetchNotifications}>
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Notifications;
