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

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8080/products/getAll');
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

        fetchData();
    }, [cookies.jwtToken]);

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
        <section>
            {notification && (
                <div className="notification">
                    {notification}
                </div>
            )}
            {isLoading ? (
                <LoadingIndicator />
            ) : (
                <div className="tovari">
                    {computers.map((computer) => (
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
                    ))}
                </div>
            )}
        </section>
    );
}

export default Catalog;
