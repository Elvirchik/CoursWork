import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import LoadingIndicator from "../components/LoadingIndicator";
import "../style/Admin.css";
import "../style/ProductForm.css";

const AddProduct = () => {
  const [cookies] = useCookies(["jwtToken"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    videoCard: "",
    processor: "",
    ram: "",
    storage: "",
    image: null,
    additionalImages: [], // Новое поле для хранения дополнительных изображений
    // Добавленные поля для точных характеристик
    cpufull: "",
    gpufull: "",
    ramfull: "",
    romfull: "",
    powerfull: "",
    casefull: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
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

  // Добавляем функцию для удаления основного изображения
  const handleRemoveMainImage = () => {
    setFormData({
      ...formData,
      image: null,
    });
    setImagePreview(null);
  };

  // Обработчик для загрузки дополнительных изображений
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData({
        ...formData,
        additionalImages: [...formData.additionalImages, ...files],
      });

      // Создаем URLs для предварительного просмотра дополнительных изображений
      const newPreviews = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setAdditionalImagePreviews([
              ...additionalImagePreviews,
              ...newPreviews,
            ]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Удаление дополнительного изображения
  const handleRemoveAdditionalImage = (index) => {
    const updatedImages = [...formData.additionalImages];
    updatedImages.splice(index, 1);

    const updatedPreviews = [...additionalImagePreviews];
    updatedPreviews.splice(index, 1);

    setFormData({
      ...formData,
      additionalImages: updatedImages,
    });
    setAdditionalImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("productName", formData.productName);
      form.append("price", formData.price);
      form.append("videoCard", formData.videoCard);
      form.append("processor", formData.processor);
      form.append("ram", formData.ram);
      form.append("storage", formData.storage);
      form.append("image", formData.image);

      // Добавляем дополнительные изображения
      formData.additionalImages.forEach((image) => {
        form.append("additionalImages", image);
      });

      // Добавляем новые поля в форму
      form.append("cpufull", formData.cpufull);
      form.append("gpufull", formData.gpufull);
      form.append("ramfull", formData.ramfull);
      form.append("romfull", formData.romfull);
      form.append("powerfull", formData.powerfull);
      form.append("casefull", formData.casefull);
      form.append("coolingCpu", formData.coolingCpu);

      const response = await fetch("http://localhost:8080/products/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
    } catch (error) {
      console.error("Ошибка при добавлении товара:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Очистка URL объекта при размонтировании компонента
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      additionalImagePreviews.forEach((preview) => {
        if (preview && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreview, additionalImagePreviews]);

  return (
    <div className="product-form-container">
      <h2>Добавление нового товара</h2>

      {success && (
        <div className="success-message">
          Товар успешно добавлен! Перенаправление на страницу товаров...
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <LoadingIndicator />
      ) : (
        <form onSubmit={handleSubmit} className="product-form">
          {/* Существующие поля формы */}
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

          <h3>Точные характеристики</h3>

          <div className="form-group">
            <label htmlFor="cpufull">Процессор (полное описание)</label>
            <input
              type="text"
              required
              id="cpufull"
              name="cpufull"
              value={formData.cpufull}
              onChange={handleChange}
            />
          </div>
        
        <div className="form-group">
            <label htmlFor="coolingCpu">Охлаждение процессоры </label>
            <input
              type="text"
              required
              id="coolimgCpu"
              name="coolingCpu"
              value={formData.coolingCpu}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gpufull">Видеокарта (полное описание)</label>
            <input
              type="text"
              required
              id="gpufull"
              name="gpufull"
              value={formData.gpufull}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ramfull">
              Оперативная память (полное описание)
            </label>
            <input
              type="text"
              required
              id="ramfull"
              name="ramfull"
              value={formData.ramfull}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="romfull">Постоянная память (полное описание)</label>
            <input
              type="text"
              required
              id="romfull"
              name="romfull"
              value={formData.romfull}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="powerfull">Блок питания</label>
            <input
              type="text"
              required
              id="powerfull"
              name="powerfull"
              value={formData.powerfull}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="casefull">Корпус</label>
            <input
              type="text"
              required
              id="casefull"
              name="casefull"
              value={formData.casefull}
              onChange={handleChange}
            />
          </div>

          {/* Блок для загрузки основного изображения */}
          <div className="form-group">
            <label htmlFor="image">Основное изображение товара</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              required
              accept="image/*"
              className="file-input"
            />
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <h4>Предварительный просмотр основного фото:</h4>
              <div className="additional-image-container">
                <img
                  src={imagePreview}
                  alt="Предварительный просмотр"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveMainImage}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Блок для загрузки дополнительных изображений */}
          <div className="form-group">
            <label htmlFor="additionalImages">Дополнительные изображения</label>
            <input
              type="file"
              id="additionalImages"
              name="additionalImages"
              onChange={handleAdditionalImagesChange}
              accept="image/*"
              multiple
              className="file-input"
            />
            <div className="file-input-hint">
              Можно выбрать несколько файлов
            </div>
          </div>

          {/* Блок предпросмотра дополнительных изображений */}
          {additionalImagePreviews.length > 0 && (
            <div className="additional-images-preview">
              <h4>Предварительный просмотр дополнительных фото:</h4>
              <div className="additional-images-grid">
                {additionalImagePreviews.map((preview, index) => (
                  <div key={index} className="additional-image-container">
                    <img
                      src={preview}
                      alt={`Дополнительное фото ${index + 1}`}
                      className="additional-image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveAdditionalImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="cancel-btn"
            >
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
