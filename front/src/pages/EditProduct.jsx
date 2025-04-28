import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import LoadingIndicator from '../components/LoadingIndicator';
import '../style/Admin.css';
import '../style/ProductForm.css';

const EditProduct = () => {
    const { id } = useParams();
    const [cookies] = useCookies(['jwtToken']);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [product, setProduct] = useState(null);
    
    const [formData, setFormData] = useState({
        productName: '',
        price: '',
        videoCard: '',
        processor: '',
        ram: '',
        storage: ''
    });

    // Загрузка данных товара при монтировании компонента
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8080/products/getOneById?id=${id}`, {
                    headers: {
                        'Authorization': `Bearer ${cookies.jwtToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных товара');
                }

                const data = await response.json();
                setProduct(data);
                
                setFormData({
                    productName: data.productName,
                    price: data.price,
                    videoCard: data.videoCard,
                    processor: data.processor,
                    ram: data.ram,
                    storage: data.storage,
                });
                
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке товара:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, cookies.jwtToken]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8080/products/update?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${cookies.jwtToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: parseInt(id),
                    productName: formData.productName,
                    price: formData.price,
                    videoCard: formData.videoCard,
                    processor: formData.processor,
                    ram: formData.ram,
                    storage: formData.storage,
                    image: product.image // Сохраняем текущее изображение
                })
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);
        } catch (error) {
            console.error('Ошибка при обновлении товара:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !product) return <LoadingIndicator />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="product-form-container">
            <h2>Редактирование товара</h2>
            
            {success && (
                <div className="success-message">
                    Товар успешно обновлен! Перенаправление на страницу товаров...
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
                    
                
                    
                    {product.image && (
                        <div className="form-group image-preview">
                            <label>Текущее изображение</label>
                            <img 
                                src={`data:image/png;base64, ${product.image}`} 
                                alt={product.productName} 
                                className="product-image-preview"
                            />
                            <div className="image-notice">
                                Изображение нельзя изменить при редактировании
                            </div>
                        </div>
                    )}
                    
                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/admin/products')} className="cancel-btn">
                            Отмена
                        </button>
                        <button type="submit" className="submit-btn">
                            Сохранить изменения
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EditProduct;
