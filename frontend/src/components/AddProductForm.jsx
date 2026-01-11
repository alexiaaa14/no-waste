import React, { useState } from 'react';

/**
 * AddProductForm Component
 * Form to add a new product to the fridge.
 * @param {Object} props - Component props.
 * @param {Function} props.onAdd - Handler to add a new product.
 */
function AddProductForm({ onAdd }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [expirationDate, setExpirationDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !category || !expirationDate) return;
        onAdd({ name, category, expirationDate });
        setName('');
        setCategory('');
        setExpirationDate('');
    };

    return (
        <form onSubmit={handleSubmit} className="add-product-form">
            <h3>Add Product</h3>
            <div className="form-group">
                <label>Name:</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Category:</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} list="categories" required />
                <datalist id="categories">
                    <option value="Dairy" />
                    <option value="Vegetables" />
                    <option value="Fruits" />
                    <option value="Meat" />
                    <option value="Grains" />
                </datalist>
            </div>
            <div className="form-group">
                <label>Expiration Date:</label>
                <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} required />
            </div>
            <button type="submit">Add to Fridge</button>
        </form>
    );
}

export default AddProductForm;
