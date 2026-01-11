import { useState } from 'react';
import '../styles/Auth.css';

const API_URL = 'http://localhost:3001';

/**
 * Auth Component
 * Handles user login and registration.
 * @param {Object} props - Component props.
 * @param {Function} props.onLogin - Handler called when user successfully logs in.
 */
function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        foodPreferences: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const foodPreferenceOptions = ['Vegan', 'Vegetarian', 'Omnivore', 'Pescetarian'];

    /**
     * Handles form input changes.
     * @param {Event} e - Input change event.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Selects food preference.
     * @param {string} pref - Food preference to select.
     */
    const selectPreference = (pref) => {
        setFormData(prev => ({
            ...prev,
            foodPreferences: pref
        }));
    };

    /**
     * Handles form submission for login or registration.
     * @param {Event} e - Form submit event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

            // Prepare payload based on login or register
            let payload;
            if (isLogin) {
                payload = {
                    email: formData.email,
                    password: formData.password
                };
            } else {
                if (!formData.foodPreferences) {
                    throw new Error('Please select a food preference');
                }

                payload = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    foodPreferences: formData.foodPreferences
                };
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data));
            onLogin(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-logo">🥗</span>
                    <h1>No Waste</h1>
                    <p>Share food, reduce waste, build community</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={isLogin ? 'active' : ''}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={!isLogin ? 'active' : ''}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Choose a username"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Food Preferences</label>
                            <div className="preferences-list">
                                {foodPreferenceOptions.map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`preference-option ${formData.foodPreferences === option ? 'active' : ''}`}
                                        onClick={() => selectPreference(option)}
                                    >
                                        <strong>{option}</strong>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? '⏳ Processing...' : (isLogin ? '🔓 Login' : '✨ Create Account')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>💚 Join the fight against food waste</p>
                </div>
            </div>
        </div>
    );
}

export default Auth;
