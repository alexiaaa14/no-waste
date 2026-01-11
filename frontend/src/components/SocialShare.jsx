import { useState } from 'react';
import '../styles/SocialShare.css';

/**
 * SocialShare Component (Simplified)
 * Allows users to copy the product link to share manually.
 * @param {Object} props - Component props.
 * @param {Object} props.product - Product to share.
 * @param {Function} props.onClose - Handler to close the share modal.
 */
function SocialShare({ product, onClose }) {
    const [copied, setCopied] = useState(false);

    // Construct the share URL (pointing to the frontend product page)
    const shareUrl = `${window.location.origin}/product/${product.id}`;

    /**
     * Copies share URL to clipboard.
     */
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers or non-secure contexts if needed
            alert(`Link: ${shareUrl}`);
        }
    };

    /**
     * Gets days until expiration.
     */
    const getDaysUntilExpiration = (date) => {
        const today = new Date();
        const exp = new Date(date);
        const diffTime = exp - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysUntilExpiration(product.expirationDate);

    return (
        <div className="social-share-overlay" onClick={onClose}>
            <div className="social-share-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>

                <div className="share-header">
                    <h2>📤 Share Product</h2>
                    <p>Share this product with your friends on social media!</p>
                </div>

                <div className="product-preview">
                    <h3>{product.name}</h3>
                    <div className="product-info">
                        <span className="category-badge">{product.category}</span>
                        <span className={`expiration-badge ${daysLeft <= 3 ? 'urgent' : ''}`}>
                            📅 {daysLeft} days left
                        </span>
                    </div>
                </div>

                <div className="copy-link-section" style={{ marginTop: '20px' }}>
                    <div className="link-display">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            onClick={(e) => e.target.select()}
                        />
                        <button
                            className={`copy-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopyLink}
                        >
                            {copied ? '✅ Copied!' : '📋 Copy Link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SocialShare;
