import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import "../style/ProductDetail.css";

const ProductDetail = () => {
  const API_URL = "http://localhost:8080";
  const { id } = useParams();
  const navigate = useNavigate();
  const [cookies] = useCookies(['jwtToken']);
  const [userId, setUserId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const mainImageRef = useRef(null);
  // Добавляем состояние для уведомления
  const [notification, setNotification] = useState(null);

  // Извлечение userId из JWT токена
  useEffect(() => {
    if (cookies.jwtToken) {
      try {
        const decodedToken = jwtDecode(cookies.jwtToken);
        setUserId(decodedToken.userId);
      } catch (decodeError) {
        toast.error("Ошибка аутентификации");
      }
    }
  }, [cookies.jwtToken]);

  // Получение данных о товаре
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/getOne?id=${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Не удалось загрузить информацию о товаре");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Автоматическое скрытие уведомления через 5 секунд
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Добавление товара в корзину
  const addToCart = async (e) => {
    if (e) e.preventDefault();
    
    if (!userId) {
      toast.error("Необходимо войти для добавления товара в корзину.");
      navigate("/login"); // Перенаправление на страницу входа
      return;
    }

    try {
      const response = await fetch(`${API_URL}/carts/user/${userId}/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': cookies.jwtToken ? `Bearer ${cookies.jwtToken}` : ''
        },
        credentials: 'include', // Важно для отправки куки
        body: JSON.stringify({ quantity: quantity }),
      });
      
      if (response.ok) {
        // Показываем и тост, и уведомление на странице
        toast.success("Товар успешно добавлен в корзину");
        setNotification({
          type: 'success',
          message: `Товар "${product.productName}" успешно добавлен в корзину в количестве ${quantity} шт.`
        });
      } else {
        const errorText = await response.text().catch(() => "Неизвестная ошибка");
        toast.error(`Ошибка при добавлении товара в корзину: ${errorText || response.status}`);
      }
    } catch (error) {
      toast.error('Ошибка сети при добавлении товара в корзину.');
    }
  };

  // Синхронизация миниатюр с основным изображением
  useEffect(() => {
    // Убедиться, что выбранное изображение всегда видно в миниатюрах
    if (selectedImage < thumbnailStartIndex) {
      setThumbnailStartIndex(selectedImage);
    } else if (selectedImage >= thumbnailStartIndex + 4) {
      setThumbnailStartIndex(selectedImage - 3);
    }
  }, [selectedImage]);

  // Навигация по основным изображениям с анимацией
  const handleNextImage = () => {
    if (!isImageTransitioning && allImages && allImages.length > 0) {
      animateImageChange((prevIndex) => (prevIndex + 1) % allImages.length);
    }
  };

  const handlePrevImage = () => {
    if (!isImageTransitioning && allImages && allImages.length > 0) {
      animateImageChange((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
    }
  };

  // Функция для анимации смены изображения
  const animateImageChange = (indexUpdater) => {
    setIsImageTransitioning(true);
    
    // Добавляем класс для плавного исчезновения
    if (mainImageRef.current) {
      mainImageRef.current.style.opacity = 0;
    }
    
    // После исчезновения меняем изображение и запускаем появление
    setTimeout(() => {
      setSelectedImage(indexUpdater);
      
      setTimeout(() => {
        if (mainImageRef.current) {
          mainImageRef.current.style.opacity = 1;
        }
        setIsImageTransitioning(false);
      }, 50);
    }, 300); // Время исчезновения
  };

  if (loading) {
    return <div className="container mt-5 text-center">Загрузка...</div>;
  }

  if (!product) {
    return <div className="container mt-5 text-center">Товар не найден</div>;
  }

  // Преобразование байтового массива в формат изображения
  const getImageSrc = (imageData) => {
    if (!imageData) return "";
    return `data:image/jpeg;base64,${imageData}`;
  };

  // Подготовка всех изображений для галереи
  const allImages = [
    { src: getImageSrc(product.image), alt: product.productName },
  ];

  if (product.additionalImages && product.additionalImages.length > 0) {
    product.additionalImages.forEach((img, index) => {
      allImages.push({
        src: getImageSrc(img),
        alt: `${product.productName} - изображение ${index + 1}`,
      });
    });
  }

  // Навигация по миниатюрам с анимацией
  const handlePrevThumbnails = () => {
    if (thumbnailStartIndex > 0) {
      setThumbnailStartIndex(thumbnailStartIndex - 1);
    }
  };

  const handleNextThumbnails = () => {
    if (thumbnailStartIndex + 4 < allImages.length) {
      setThumbnailStartIndex(thumbnailStartIndex + 1);
    }
  };

  // Выбор конкретной миниатюры
  const handleThumbnailClick = (index) => {
    if (!isImageTransitioning) {
      animateImageChange(() => index);
    }
  };

  // Видимые миниатюры (только 4 за раз)
  const visibleThumbnails = allImages.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + 4
  );

  return (
    <div className="container mt-5">
      {/* Компонент уведомления о добавлении в корзину */}
      {notification && (
        <div className={`cart-notification ${notification.type}`}>
          <div className="notification-content">
            <span>{notification.message}</span>
            <button 
              className="notification-close" 
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <div className="row">
        {/* Левая колонка с галереей */}
        <div className="col-md-6">
          <div className="product-gallery d-flex">
            {/* Миниатюры слева с навигацией */}
            <div className="thumbnails-vertical me-3">
              {/* Стрелка вверх - если есть предыдущие миниатюры */}
              {thumbnailStartIndex > 0 && (
                <div 
                  className="thumbnail-nav thumbnail-nav-up mb-2 text-center" 
                  onClick={handlePrevThumbnails}
                >
                  <span>▲</span>
                </div>
              )}
              
              {/* Контейнер для миниатюр с анимацией */}
              <div className="thumbnails-container">
                {/* Видимые миниатюры - только 4 */}
                {visibleThumbnails.map((image, index) => {
                  const actualIndex = thumbnailStartIndex + index;
                  return (
                    <div 
                      key={actualIndex} 
                      className={`thumbnail-item mb-2 ${actualIndex === selectedImage ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(actualIndex)}
                    >
                      <img 
                        src={image.src} 
                        alt={`Миниатюра ${actualIndex + 1}`} 
                        className="img-fluid" 
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Стрелка вниз - если есть следующие миниатюры */}
              {thumbnailStartIndex + 4 < allImages.length && (
                <div 
                  className="thumbnail-nav thumbnail-nav-down mt-2 text-center" 
                  onClick={handleNextThumbnails}
                >
                  <span>▼</span>
                </div>
              )}
            </div>
            
            {/* Основное изображение справа с фиксированным размером и стрелками навигации */}
            <div className="main-image-container position-relative">
              {/* Стрелка влево */}
              {allImages.length > 1 && (
                <div 
                  className="image-nav image-nav-left" 
                  onClick={handlePrevImage}
                >
                  <span>◀</span>
                </div>
              )}
              
              {/* Основное изображение с анимацией */}
              <div className="main-image-wrapper">
                <img 
                  ref={mainImageRef}
                  src={allImages[selectedImage]?.src} 
                  alt={allImages[selectedImage]?.alt} 
                  className="main-product-image"
                />
              </div>
              
              {/* Стрелка вправо */}
              {allImages.length > 1 && (
                <div 
                  className="image-nav image-nav-right" 
                  onClick={handleNextImage}
                >
                  <span>▶</span>
                </div>
              )}
              
              {/* Точки-индикаторы под изображением */}
              <div className="image-dots d-flex justify-content-center mt-3">
                {allImages.map((_, index) => (
                  <div 
                    key={index} 
                    className={`image-dot ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка с информацией о товаре */}
        <div className="col-md-6">
          <h1 className="mb-3">{product.productName}</h1>
          
          {/* Перемещенный блок цены и кнопки добавления в корзину */}
          <div className="price-action-container d-flex align-items-center mb-4">
            <h3 className="text-kisli mb-0 me-3">
              {product.price.toLocaleString()} ₽
            </h3>
            
            
            <div className="product-actions">
              <div className="quantity-control me-2">
                <button 
                  className="quantity-btn" 
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >-</button>
                <span className="quantity">{quantity}</span>
                <button 
                  className="quantity-btn" 
                  onClick={() => setQuantity(quantity + 1)}
                >+</button>
              </div>
              <button 
                className="buy" 
                onClick={(e) => addToCart(e)}
              >
                В корзину
              </button>
            </div>
          </div>

          <div className="product-details mb-4">
            <h4>Характеристики:</h4>
            <table className="table">
              <tbody>
                <tr>
                  <td>Процессор:</td>
                  <td> {product.cpufull}</td>
                </tr>
                <tr>
                  <td>Видеокарта:</td>
                  <td> {product.gpufull}</td>
                </tr>
                <tr>
                  <td>Оперативная память:</td>
                  <td>{product.ramfull}</td>
                </tr>
                <tr>
                  <td>Постоянная память:</td>
                  <td>{product.romfull}</td>
                </tr>
                <tr>
                  <td>Блок питания:</td>
                  <td>{product.powerfull}</td>
                </tr>
                <tr>
                  <td>Корпус:</td>
                  <td>{product.casefull}</td>
                </tr>
                <tr>
                  <td>Охлаждение процессора:</td>
                  <td>{product.coolingCpu}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
