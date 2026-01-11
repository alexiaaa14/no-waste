import { useState, useEffect } from 'react';
import '../styles/Claims.css';

const API_URL = 'http://localhost:3001';

/**
 * Claims Component
 * Manages product claiming - browse available products and claim them.
 * @param {Object} props - Component props.
 * @param {Object} props.user - Current logged-in user.
 */
function Claims({ user }) {
    const [availableProducts, setAvailableProducts] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [claimsOnMyProducts, setClaimsOnMyProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('available');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Fetches available products from other users.
     */
    const fetchAvailableProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/products?status=AVAILABLE`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            // Filter out user's own products
            setAvailableProducts(data.filter(p => p.userId !== user.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetches claims made by the current user.
     */
    const fetchMyClaims = async () => {
        try {
            const response = await fetch(`${API_URL}/api/claims?userId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch claims');
            const data = await response.json();
            setMyClaims(data);
        } catch (err) {
            console.error('Error fetching claims:', err);
        }
    };

    /**
     * Fetches claims on the current user's products.
     */
    const fetchClaimsOnMyProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/claims?ownerId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch claims');
            const data = await response.json();
            setClaimsOnMyProducts(data);
        } catch (err) {
            console.error('Error fetching claims on my products:', err);
        }
    };

    useEffect(() => {
        fetchAvailableProducts();
        fetchMyClaims();
        fetchClaimsOnMyProducts();
    }, [user.id]);

    /**
     * Claims a product.
     * @param {number} productId - Product ID to claim.
     */
    const handleClaimProduct = async (productId) => {
        const message = prompt('Add a message for the owner (optional):');

        try {
            const response = await fetch(`${API_URL}/api/claims`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    claimerId: user.id,
                    message: message || ''
                })
            });

            if (!response.ok) throw new Error('Failed to claim product');

            await fetchAvailableProducts();
            await fetchMyClaims();
            alert('✅ Claim submitted! Wait for the owner to respond.');
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * Updates claim status (accept/reject).
     * @param {number} claimId - Claim ID.
     * @param {string} status - New status ('ACCEPTED' or 'REJECTED').
     */
    const handleUpdateClaim = async (claimId, status) => {
        try {
            const response = await fetch(`${API_URL}/api/claims/${claimId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update claim');

            await fetchClaimsOnMyProducts();
            await fetchAvailableProducts();
            alert(`✅ Claim ${status.toLowerCase()}!`);
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * Gets days until expiration.
     * @param {string} date - Expiration date.
     * @returns {number} Days remaining.
     */
    const getDaysUntilExpiration = (date) => {
        const today = new Date();
        const exp = new Date(date);
        const diffTime = exp - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    /**
     * Gets status badge class.
     * @param {string} status - Claim status.
     * @returns {string} CSS class name.
     */
    const getStatusClass = (status) => {
        const statusMap = {
            PENDING: 'status-pending',
            pending: 'status-pending',
            ACCEPTED: 'status-accepted',
            accepted: 'status-accepted',
            REJECTED: 'status-rejected',
            rejected: 'status-rejected',
            COMPLETED: 'status-completed',
            completed: 'status-completed'
        };
        return statusMap[status] || '';
    };

    return (
        <div className="claims-container">
            <div className="claims-header">
                <h2>🤝 Product Claims</h2>
            </div>

            {error && (
                <div className="error-banner">
                    <span>⚠️</span> {error}
                </div>
            )}

            <div className="claims-tabs">
                <button
                    className={activeTab === 'available' ? 'active' : ''}
                    onClick={() => setActiveTab('available')}
                >
                    🛒 Available Products ({availableProducts.length})
                </button>
                <button
                    className={activeTab === 'myClaims' ? 'active' : ''}
                    onClick={() => setActiveTab('myClaims')}
                >
                    📋 My Claims ({myClaims.length})
                </button>
                <button
                    className={activeTab === 'requests' ? 'active' : ''}
                    onClick={() => setActiveTab('requests')}
                >
                    📥 Claim Requests ({claimsOnMyProducts.length})
                </button>
            </div>

            <div className="claims-content">
                {/* Available Products Tab */}
                {activeTab === 'available' && (
                    <div className="available-products">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : availableProducts.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">🛒</span>
                                <h3>No available products</h3>
                                <p>Check back later for products shared by the community!</p>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {availableProducts.map(product => {
                                    const daysLeft = getDaysUntilExpiration(product.expirationDate);
                                    const alreadyClaimed = myClaims.some(c => c.productId === product.id);

                                    return (
                                        <div key={product.id} className="product-card">
                                            <div className="product-header">
                                                <h3>{product.name}</h3>
                                                <span className="category-badge">{product.category}</span>
                                            </div>

                                            <div className="product-details">
                                                <p className="owner-info">
                                                    👤 Shared by: <strong>{product.owner?.username || 'Unknown'}</strong>
                                                </p>
                                                <p className={`expiration-info ${daysLeft <= 3 ? 'urgent' : ''}`}>
                                                    📅 Expires: {product.expirationDate} ({daysLeft} days)
                                                </p>
                                            </div>

                                            {alreadyClaimed ? (
                                                <div className="already-claimed">
                                                    ✅ You've already claimed this
                                                </div>
                                            ) : (
                                                <button
                                                    className="claim-btn"
                                                    onClick={() => handleClaimProduct(product.id)}
                                                >
                                                    🤝 Claim This Product
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* My Claims Tab */}
                {activeTab === 'myClaims' && (
                    <div className="my-claims">
                        {myClaims.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📋</span>
                                <h3>No claims yet</h3>
                                <p>Browse available products and claim what you need!</p>
                            </div>
                        ) : (
                            <div className="claims-list">
                                {myClaims.map(claim => (
                                    <div key={claim.id} className="claim-card">
                                        <div className="claim-header">
                                            <h3>{claim.product?.name}</h3>
                                            <span className={`status-badge ${getStatusClass(claim.status)}`}>
                                                {claim.status}
                                            </span>
                                        </div>

                                        <div className="claim-details">
                                            <p>📦 Category: {claim.product?.category}</p>
                                            <p>👤 Owner: {claim.product?.owner?.username}</p>
                                            <p>📅 Expires: {claim.product?.expirationDate}</p>
                                            {claim.message && (
                                                <p className="claim-message">💬 Your message: "{claim.message}"</p>
                                            )}
                                            <p className="claim-date">
                                                🕒 Claimed: {new Date(claim.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Claim Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="claim-requests">
                        {claimsOnMyProducts.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📥</span>
                                <h3>No claim requests</h3>
                                <p>When someone claims your products, they'll appear here!</p>
                            </div>
                        ) : (
                            <div className="claims-list">
                                {claimsOnMyProducts.map(claim => (
                                    <div key={claim.id} className="claim-card">
                                        <div className="claim-header">
                                            <h3>{claim.product?.name}</h3>
                                            <span className={`status-badge ${getStatusClass(claim.status)}`}>
                                                {claim.status}
                                            </span>
                                        </div>

                                        <div className="claim-details">
                                            <p>👤 Requested by: <strong>{claim.claimer?.username}</strong></p>
                                            <p>📧 Email: {claim.claimer?.email}</p>
                                            {claim.message && (
                                                <p className="claim-message">💬 Message: "{claim.message}"</p>
                                            )}
                                            <p className="claim-date">
                                                🕒 Requested: {new Date(claim.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {(claim.status === 'PENDING' || claim.status === 'pending') && (
                                            <div className="claim-actions">
                                                <button
                                                    className="accept-btn"
                                                    onClick={() => handleUpdateClaim(claim.id, 'ACCEPTED')}
                                                >
                                                    ✅ Accept
                                                </button>
                                                <button
                                                    className="reject-btn"
                                                    onClick={() => handleUpdateClaim(claim.id, 'REJECTED')}
                                                >
                                                    ❌ Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Claims;
