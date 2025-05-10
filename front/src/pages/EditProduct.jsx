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
        storage: '',
        cpufull: '',
        gpufull: '',
        ramfull: '',
        romfull: '',
        powerfull: '',
        casefull: '',
        coolingCpu: ''
    });
    
    const [mainImage, setMainImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

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
                    cpufull: data.cpufull || '',
                    gpufull: data.gpufull || '',
                    ramfull: data.ramfull || '',
                    romfull: data.romfull || '',
                    powerfull: data.powerfull || '',
                    casefull: data.casefull || '',
                    coolingCpu: data.coolingCpu || ''
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            
            // Создание предпросмотра изображения
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setAdditionalImages([...additionalImages, ...files]);
        
        // Создание предпросмотров для новых дополнительных изображений
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdditionalImagePreviews(prevPreviews => [...prevPreviews, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Функция для удаления основного изображения
    const handleRemoveMainImage = () => {
        setMainImage(null);
        setImagePreview(null);
        // Сбросить значение input file
        document.getElementById('image').value = '';
    };

    // Функция для удаления дополнительного изображения по индексу
    const handleRemoveAdditionalImage = (index) => {
        const newImages = [...additionalImages];
        newImages.splice(index, 1);
        setAdditionalImages(newImages);

        const newPreviews = [...additionalImagePreviews];
        newPreviews.splice(index, 1);
        setAdditionalImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Используем FormData для отправки multipart/form-data
            const form = new FormData();
            form.append('id', id);
            form.append('productName', formData.productName);
            form.append('price', formData.price);
            form.append('videoCard', formData.videoCard);
            form.append('processor', formData.processor);
            form.append('ram', formData.ram);
            form.append('storage', formData.storage);
            form.append('cpufull', formData.cpufull);
            form.append('gpufull', formData.gpufull);
            form.append('ramfull', formData.ramfull);
            form.append('romfull', formData.romfull);
            form.append('powerfull', formData.powerfull);
            form.append('casefull', formData.casefull);
            form.append('coolingCpu', formData.coolingCpu);
            
            // Добавляем изображение только если оно было изменено
            if (mainImage) {
                form.append('image', mainImage);
            }
            
            // Добавляем дополнительные изображения если они есть
            if (additionalImages.length > 0) {
                additionalImages.forEach(image => {
                    form.append('additionalImages', image);
                });
            }

            const response = await fetch(`http://localhost:8080/products/update-with-image`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${cookies.jwtToken}`
                    // Не устанавливаем Content-Type, браузер автоматически установит его с boundary для FormData
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
            console.error('Ошибка при обновлении товара:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Добавить все дополнительные изображения
    const addAllImages = (e) => {
        const fileInput = document.getElementById('additionalImages');
        fileInput.click();
    };

    // Очистить все дополнительные изображения
    const clearAllAdditionalImages = () => {
        setAdditionalImages([]);
        setAdditionalImagePreviews([]);
        document.getElementById('additionalImages').value = '';
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
                <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
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
                    
                    <h3>Подробные характеристики</h3>
                    
                    <div className="form-group">
                        <label htmlFor="cpufull">Процессор (подробно)</label>
                        <input
                            type="text"
                            required
                            id="cpufull"
                            name="cpufull"
                            value={formData.cpufull}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="coolingCpu">Охлаждение процессора</label>
                        <input
                            type="text"
                            required
                            id="coolingCpu"
                            name="coolingCpu"
                            value={formData.coolingCpu}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="gpufull">Видеокарта (подробно)</label>
                        <input
                            type="text"
                            required
                            id="gpufull"
                            name="gpufull"
                            value={formData.gpufull}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="ramfull">Оперативная память (подробно)</label>
                        <input
                            type="text"
                            required
                            id="ramfull"
                            name="ramfull"
                            value={formData.ramfull}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="romfull">Накопитель (подробно)</label>
                        <input
                            type="text"
                            required
                            id="romfull"
                            name="romfull"
                            value={formData.romfull}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="powerfull">Блок питания (подробно)</label>
                        <input
                            type="text"
                            required
                            id="powerfull"
                            name="powerfull"
                            value={formData.powerfull}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="casefull">Корпус (подробно)</label>
                        <input
                            type="text"
                            required
                            id="casefull"
                            name="casefull"
                            value={formData.casefull}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="image">Основное изображение товара</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="file-input"
                        />
                        <div className="image-tip">Загрузите новое изображение только если хотите заменить текущее</div>
                    </div>

                    {imagePreview ? (
                        <div className="form-group image-preview">
                            <label>Новое изображение (предпросмотр)</label>
                            <div className="image-preview-container">
                                <img 
                                    src={imagePreview} 
                                    alt="Предпросмотр" 
                                    className="product-image-preview"
                                />
                                <button 
                                    type="button" 
                                    className="remove-image-btn" 
                                    onClick={handleRemoveMainImage}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ) : product.image && (
                        <div className="form-group image-preview">
                            <label>Текущее изображение</label>
                            <img 
                                src={`data:image/png;base64, ${product.image}`} 
                                alt={product.productName} 
                                className="product-image-preview"
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="additionalImages">Дополнительные изображения</label>
                        <div className="additional-images-actions">
                            <input
                                type="file"
                                id="additionalImages"
                                name="additionalImages"
                                onChange={handleAdditionalImagesChange}
                                accept="image/*"
                                multiple
                                className="file-input"
                                style={{ display: 'none' }}
                            />
                            <button 
                                type="button" 
                                className="add-images-btn" 
                                onClick={addAllImages}
                            >
                                Добавить изображения
                            </button>
                            {additionalImages.length > 0 && (
                                <button 
                                    type="button" 
                                    className="clear-images-btn" 
                                    onClick={clearAllAdditionalImages}
                                >
                                    Очистить все
                                </button>
                            )}
                        </div>
                        <div className="image-tip">
                            Для добавления новых фото нажмите "Добавить изображения". Можно выбрать несколько файлов одновременно.
                        </div>
                        <div className="image-tip">
                            Загруженные изображения заменят существующие дополнительные фото.
                        </div>
                    </div>
                    
                    {additionalImagePreviews.length > 0 && (
                        <div className="form-group additional-images-preview">
                            <label>Новые дополнительные изображения ({additionalImagePreviews.length})</label>
                            <div className="additional-images-container">
                                {additionalImagePreviews.map((preview, index) => (
                                    <div key={index} className="additional-image-wrapper">
                                        <img 
                                            src={preview} 
                                            alt={`Дополнительное изображение ${index + 1}`} 
                                            className="additional-image-preview"
                                        />
                                        <button 
                                            type="button" 
                                            className="remove-image-btn" 
                                            onClick={() => handleRemoveAdditionalImage(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {product.additionalImages && product.additionalImages.length > 0 && (
                        <div className="form-group additional-images-preview">
                            <label>Текущие дополнительные изображения ({product.additionalImages.length})</label>
                            <div className="additional-images-container">
                                {product.additionalImages.map((image, index) => (
                                    <img 
                                        key={index}
                                        src={`data:image/png;base64, ${image}`} 
                                        alt={`Дополнительное изображение ${index + 1}`} 
                                        className="additional-image-preview"
                                    />
                                ))}
                            </div>
                            <div className="image-tip warning">
                                Внимание: при загрузке новых дополнительных изображений, текущие будут заменены!
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
