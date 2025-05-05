import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import '../style/Catalog.css';
import GPU from '../assets/img/Videocard.png';
import CPU from '../assets/img/CPU.png';
import RAM from '../assets/img/RAM.png';
import ROM from '../assets/img/ROM.png';
import LoadingIndicator from '../components/LoadingIndicator';

function Catalog() {
    const [computers, setComputers] = useState([]);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);
    const [cookies] = useCookies(['jwtToken']);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [itemsAddedCount, setItemsAddedCount] = useState(0);

    // Состояния для фильтров
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [gpuManufacturer, setGpuManufacturer] = useState('');
    const [gpuModel, setGpuModel] = useState('');
    const [cpuLine, setCpuLine] = useState('');
    const [ramSize, setRamSize] = useState('');
    const [storageMin, setStorageMin] = useState('');
    const [storageMax, setStorageMax] = useState('');
    const [filterActive, setFilterActive] = useState(false);

    useEffect(() => {
        if (cookies.jwtToken) {
            try {
                const decodedToken = jwtDecode(cookies.jwtToken);
                setUserId(decodedToken.userId);
            } catch (error) {
                console.error("Ошибка при декодировании токена:", error);
                setError("Ошибка при аутентификации.");
            }
        } else {
            setError('Пожалуйста, войдите.');
        }

        fetchComputers();
    }, [cookies.jwtToken]);

    const fetchComputers = async (withFilters = filterActive) => {
        setIsLoading(true);
        try {
            let url = 'http://localhost:8080/products/getAll';
            
            // Если фильтры применены, использовать эндпоинт для фильтрации
            if (withFilters) {
                url = 'http://localhost:8080/products/filter?';
                const params = new URLSearchParams();
                
                if (priceMin) params.append('minPrice', priceMin);
                if (priceMax) params.append('maxPrice', priceMax);
                if (gpuManufacturer) params.append('gpuManufacturer', gpuManufacturer);
                if (gpuModel) params.append('gpuModel', gpuModel);
                if (cpuLine) params.append('cpuLine', cpuLine);
                if (ramSize) params.append('ramSize', ramSize);
                if (storageMin) params.append('minStorage', storageMin);
                if (storageMax) params.append('maxStorage', storageMax);
                
                url += params.toString();
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Data from backend:', data);
            setComputers(data);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            setError("Ошибка при загрузке товаров.");
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        setFilterActive(true);
        fetchComputers(true);
    };

    const resetFilters = () => {
        setPriceMin('');
        setPriceMax('');
        setGpuManufacturer('');
        setGpuModel('');
        setCpuLine('');
        setRamSize('');
        setStorageMin('');
        setStorageMax('');
        setFilterActive(false);
        fetchComputers(false); // Немедленно обновляем каталог без фильтров
    };

    const addToCart = async (productId) => {
        if (!userId) {
            setError('Необходимо войти для добавления товара в корзину.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/carts/user/${userId}/product/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: 1 }),
            });

            if (response.ok) {
                console.log('Товар добавлен в корзину!');
                setError(null);
                setItemsAddedCount(prevCount => prevCount + 1);
                const newCount = itemsAddedCount + 1;
                setNotification(`Товар добавлен в корзину! Всего товаров добавлено: ${newCount}`);

                setTimeout(() => {
                    setNotification(null);
                }, 2000); // Clear notification after 2 seconds
            } else {
                console.error('Ошибка при добавлении товара в корзину:', response.status);
                setError(`Ошибка при добавлении товара в корзину: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            setError('Ошибка сети при добавлении товара в корзину.');
        }
    };

    return (
        <section className="catalog-container">
            <div className="filter-sidebar">
                <h3>Фильтры</h3>
                <div className="filter-group">
                    <h4>Цена (₽)</h4>
                    <div className="range-inputs">
                        <input 
                            type="number" 
                            placeholder="От" 
                            value={priceMin} 
                            onChange={(e) => setPriceMin(e.target.value)}
                            min="0"
                        />
                        <input 
                            type="number" 
                            placeholder="До" 
                            value={priceMax} 
                            onChange={(e) => setPriceMax(e.target.value)}
                            min="0"
                        />
                    </div>
                </div>
                
                <div className="filter-group">
                    <h4>Видеокарта</h4>
                    <select 
                        value={gpuManufacturer} 
                        onChange={(e) => setGpuManufacturer(e.target.value)}
                    >
                        <option value="">Выберите производителя</option>
                        <option value="AMD">AMD</option>
                        <option value="NVIDIA">NVIDIA</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="Модель (например, RTX 3060)" 
                        value={gpuModel} 
                        onChange={(e) => setGpuModel(e.target.value)}
                    />
                </div>
                
                <div className="filter-group">
                    <h4>Процессор</h4>
                    <select 
                        value={cpuLine} 
                        onChange={(e) => setCpuLine(e.target.value)}
                    >
                        <option value="">Выберите линейку</option>
                        <option value="Intel">Intel</option>
                        <option value="AMD">AMD</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <h4>Оперативная память</h4>
                    <select 
                        value={ramSize} 
                        onChange={(e) => setRamSize(e.target.value)}
                    >
                        <option value="">Выберите объем</option>
                        <option value="8">8 ГБ</option>
                        <option value="16">16 ГБ</option>
                        <option value="32">32 ГБ</option>
                        <option value="64">64 ГБ</option>
                        <option value="128">128 ГБ</option>
                        <option value="256">256 ГБ</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <h4>Постоянная память (ТБ)</h4>
                    <div className="range-inputs">
                        <input 
                            type="number" 
                            placeholder="От" 
                            value={storageMin} 
                            onChange={(e) => setStorageMin(e.target.value)}
                            min="0"
                            step="0.1"
                        />
                        <input 
                            type="number" 
                            placeholder="До" 
                            value={storageMax} 
                            onChange={(e) => setStorageMax(e.target.value)}
                            min="0"
                            step="0.1"
                        />
                    </div>
                </div>
                
                <div className="filter-buttons">
                    <button className="apply-filter" onClick={applyFilters}>Применить фильтры</button>
                    <button className="reset-filter" onClick={resetFilters}>Сбросить фильтры</button>
                </div>
            </div>

            <div className="catalog-content">
                {notification && (
                    <div className="notification">
                        {notification}
                    </div>
                )}
                {isLoading ? (
                    <LoadingIndicator />
                ) : (
                    <div className="tovari">
                        {computers.length > 0 ? (
                            computers.map((computer) => (
                                <div className="card_tovara" key={computer.id}>
                                    {computer.image ? (
                                        <img
                                            src={`data:image/png;base64, ${computer.image}`}
                                            alt={computer.productName}
                                            className="name price bue"
                                        />
                                    ) : (
                                        <div>No Image</div>
                                    )}
                                    <div className="name_price_bue">
                                        <h4>{computer.productName}</h4>
                                        <div>
                                            <div>{computer.price} ₽</div>
                                            <button className="buy" onClick={() => addToCart(computer.id)}>
                                                В корзину
                                            </button>
                                        </div>
                                    </div>
                                    <div className="konfi">
                                        <div className="konfiguration">
                                            <img src={GPU} alt="Видеокарта" />
                                            <div>
                                                <div>Видеокарта</div>
                                                <div>{computer.videoCard}</div>
                                            </div>
                                        </div>
                                        <div className="konfiguration">
                                            <img src={CPU} alt="Процессор" />
                                            <div>
                                                <div>Процессор</div>
                                                <div>{computer.processor}</div>
                                            </div>
                                        </div>
                                        <div className="konfiguration">
                                            <img src={RAM} alt="Оперативная память" />
                                            <div>
                                                <div>Оперативная память</div>
                                                <div>{computer.ram} Гб</div>
                                            </div>
                                        </div>
                                        <div className="konfiguration">
                                            <img src={ROM} alt="Постоянная память" />
                                            <div>
                                                <div>Постоянная память</div>
                                                <div>{computer.storage} Тб</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-products">
                                <h3>Товары не найдены</h3>
                                <p>Попробуйте изменить параметры фильтрации</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Catalog;
