// src/components/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import '../style/Profile.css';
import GPU from '../assets/img/Videocard.png';
import CPU from '../assets/img/CPU.png';
import RAM from '../assets/img/RAM.png';
import ROM from '../assets/img/ROM.png';
import '../style/Orders.css';
import LoadingIndicator from '../components/LoadingIndicator'; // Import LoadingIndicator component

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);
    const [cookies] = useCookies(['jwtToken']);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

    useEffect(() => {
        if (cookies.jwtToken) {
            try {
                const decodedToken = jwtDecode(cookies.jwtToken);
                setUserId(decodedToken.userId);
            } catch (decodeError) {
                console.error("Ошибка при декодировании токена:", decodeError);
                setError("Ошибка аутентификации");
            }
        } else {
            setError("Пожалуйста, войдите.");
        }
    }, [cookies.jwtToken]);

// Make sure the filtering logic is correct
useEffect(() => {
    const fetchOrders = async () => {
        setIsLoading(true);
        if (userId) {
            try {
                let url = `http://localhost:8080/orders/user/${userId}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Проверяем, является ли data массивом
                const ordersArray = Array.isArray(data) ? data : (data.content || []);
                
                // Filter orders based on activeTab
                let filteredOrders = [];
                if (activeTab === 'active') {
                    filteredOrders = ordersArray.filter(order =>
                        ['формируется', 'на обработке', 'собирается', 'доставляется'].includes(order.status)
                    );
                } else if (activeTab === 'completed') {
                    filteredOrders = ordersArray.filter(order =>
                        ['завершен', 'откланён'].includes(order.status)
                    );
                }
    
                // Reverse the order of the filtered orders to show newest first
                const reversedOrders = [...filteredOrders].reverse();
                setOrders(reversedOrders);
    
            } catch (fetchError) {
                console.error("Ошибка при получении заказов:", fetchError);
                setError("Ошибка при загрузке заказов.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    fetchOrders();
}, [userId, activeTab]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <section className="container order">
            <h1>Ваши заказы</h1>

            {/* Order status tabs */}
            <div className="order-status-tabs">
                <button
                    className={activeTab === 'active' ? 'active' : ''}
                    onClick={() => setActiveTab('active')}
                >
                    Активные
                </button>
                <button
                    className={activeTab === 'completed' ? 'active' : ''}
                    onClick={() => setActiveTab('completed')}
                >
                    Завершённые
                </button>
            </div>

            {isLoading ? (
                <LoadingIndicator /> // Show loading indicator while loading
            ) : (
                orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.id} className="two_user">
                            <div className='txt1'>
                                <div><strong>ID заказа:</strong> {order.id}</div>
                                <div><strong>Статус заказа:</strong> {order.status}</div>
                                <div><strong>Сумма заказа:</strong> {order.totalAmount} ₽</div>
                                <div><strong>Количество товаров:</strong> {order.quantity}</div>
                                <div><strong>Адрес доставки:</strong> {order.deliveryAddress}</div> {/* Display delivery address */}
                            </div>
                            <div className='txt2'>
                                <strong>Состав заказа:</strong>
                                <div className="tovari_orders">
                                    {order.products && order.products.length > 0 ? (
                                        order.products.map(product => (
                                            <div className="card_tovara_orders" key={product.id}>
                                                {product.image ? (
                                                    <img
                                                        src={`data:image/png;base64, ${product.image}`}
                                                        alt={product.productName}
                                                        className="name price bue"
                                                    />
                                                ) : (
                                                    <div>No Image</div>
                                                )}
                                                <div className="name_price_bue">
                                                    <h4>{product.productName}</h4>
                                                    <div>
                                                        <div className='fs-10'> Кол-во: {order.orderProducts?.find(op => op.productId === product.id)?.quantity || 0}</div>
                                                        <div>{product.price} ₽</div>
                                                    </div>
                                                </div>
                                                <div className="konfi">
                                                    <div className="konfiguration">
                                                        <img src={GPU} alt="Видеокарта" />
                                                        <div>
                                                            <div>Видеокарта</div>
                                                            <div>{product.videoCard}</div>
                                                        </div>
                                                    </div>
                                                    <div className="konfiguration">
                                                        <img src={CPU} alt="Процессор" />
                                                        <div>
                                                            <div>Процессор</div>
                                                            <div>{product.processor}</div>
                                                        </div>
                                                    </div>
                                                    <div className="konfiguration">
                                                        <img src={RAM} alt="Оперативная память" />
                                                        <div>
                                                            <div>Оперативная память</div>
                                                            <div>{product.ram} Гб</div>
                                                        </div>
                                                    </div>
                                                    <div className="konfiguration">
                                                        <img src={ROM} alt="Постоянная память" />
                                                        <div>
                                                            <div>Постоянная память</div>
                                                            <div>{product.storage} Тб</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div>Товары не найдены</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>У вас пока нет заказов.</div>
                )
            )}
        </section>
    );
};

export default Orders;
