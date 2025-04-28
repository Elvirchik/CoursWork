import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import LoadingIndicator from '../components/LoadingIndicator';
import '../style/Admin.css';
import '../style/ProductForm.css';

const AddProduct = () => {
    const [cookies] = useCookies(['jwtToken']);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    
    const [formData, setFormData] = useState({
        productName: '',
        price: '',
        videoCard: '',
        processor: '',
        ram: '',
        storage: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file
            });
            
            // Создаем URL для предварительного просмотра
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const form = new FormData();
            form.append('productName', formData.productName);
            form.append('price', formData.price);
            form.append('videoCard', formData.videoCard);
            form.append('processor', formData.processor);
            form.append('ram', formData.ram);
            form.append('storage', formData.storage);
            form.append('image', formData.image);

            const response = await fetch('http://localhost:8080/products/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cookies.jwtToken}`
                },
                body: form
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Очистка URL объекта при размонтировании компонента
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <div className="product-form-container">
            <h2>Добавление нового товара</h2>
            
            {success && (
                <div className="success-message">
                    Товар успешно добавлен! Перенаправление на страницу товаров...
                </div>
            )}
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {loading ? (
                <LoadingIndicator />
            ) : (
                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-group">
                        <label htmlFor="productName">Название товара</label>
                        <input
                            type="text"
                            id="productName"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="price">Цена (₽)</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="videoCard">Видеокарта</label>
                        <input
                            type="text"
                            id="videoCard"
                            name="videoCard"
                            value={formData.videoCard}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="processor">Процессор</label>
                        <input
                            type="text"
                            id="processor"
                            name="processor"
                            value={formData.processor}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="ram">Оперативная память (Гб)</label>
                        <input
                            type="text"
                            id="ram"
                            name="ram"
                            value={formData.ram}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="storage">Постоянная память (Тб)</label>
                        <input
                            type="text"
                            id="storage"
                            name="storage"
                            value={formData.storage}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="image">Изображение товара</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            required
                            accept="image/*"
                        />
                        
                        
                        
                    </div>
                    {imagePreview && (
                            <div className="image-preview-container">
                                <h4>Предварительный просмотр фото:</h4>
                                <img 
                                    src={imagePreview} 
                                    alt="Предварительный просмотр" 
                                    className="image-preview" 
                                />
                            </div>
                        )}
                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/admin/products')} className="cancel-btn">
                            Отмена
                        </button>
                        <button type="submit" className="submit-btn">
                            Добавить товар
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddProduct;
