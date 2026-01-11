import React, { useState } from 'react';
import SocialShare from './SocialShare';
import ShareProductModal from './ShareProductModal';
import '../styles/ProductList.css';

/**
 * ProductList Component
 * Displays a list of products grouped by category.
 * @param {Object} props - Component props.
 * @param {Array} props.products - List of products.
 * @param {Function} props.onMarkAvailable - Handler to mark product as available.
 * @param {Function} props.onDelete - Handler to delete product.
 */
function ProductList({ products, onMarkAvailable, onDelete }) {
    const [shareProduct, setShareProduct] = useState(null);
    const [sharer, setSharer] = useState(null);
    const categories = [...new Set(products.map(p => p.category))];

    /**
     * Calculates days until expiration.
     * @param {string} date - Expiration date string.
     * @returns {number} Days remaining.
     */
    const getDaysUntilExpiration = (date) => {
        const today = new Date();
        const exp = new Date(date);
        const diffTime = exp - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <>
            <div className="product-list">
                {categories.map(category => (
                    <div key={category} className="category-section">
                        <h3>{category}</h3>
                        <ul>
                            {products.filter(p => p.category === category).map(product => {
                                const daysLeft = getDaysUntilExpiration(product.expirationDate);
                                const isExpiring = daysLeft <= 3 && daysLeft >= 0;
                                const isExpired = daysLeft < 0;

                                return (
                                    <li key={product.id} className={`product-item ${isExpiring ? 'expiring' : ''} ${isExpired ? 'expired' : ''}`}>
                                        <div className="product-info">
                                            <span className="product-name">{product.name}</span>
                                            <span className="product-date">Expires: {product.expirationDate} ({daysLeft} days)</span>
                                            <span className={`product-status status-${product.status.toLowerCase()}`}>{product.status}</span>
                                        </div>
                                        <div className="product-actions">
                                            {product.status === 'IN_FRIDGE' && (
                                                <button onClick={() => setSharer(product)} className="mark-available-btn">Mark Available</button>
                                            )}
                                            {product.status === 'AVAILABLE' && (
                                                <div className="action-row">
                                                    <button onClick={() => setShareProduct(product)} className="share-btn">📤 Share Link</button>
                                                    <button onClick={() => setSharer(product)} className="edit-share-btn">⚙️ Edit Sharing</button>
                                                </div>
                                            )}
                                            <button onClick={() => onDelete(product.id)} className="delete-btn">Delete</button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Sharing within App (Product Visibility) */}
            {sharer && (
                <ShareProductModal
                    user={JSON.parse(localStorage.getItem('user'))}
                    product={sharer}
                    onClose={() => setSharer(null)}
                    onConfirm={(settings) => {
                        onMarkAvailable(sharer.id, settings);
                        setSharer(null);
                    }}
                />
            )}

            {/* Sharing to Social Media (External) */}
            {shareProduct && (
                <SocialShare
                    product={shareProduct}
                    onClose={() => setShareProduct(null)}
                />
            )}
        </>
    );
}

export default ProductList;
