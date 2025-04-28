// src/components/UserOrders.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import '../style/Orders.css';
import GPU from '../assets/img/Videocard.png';
import CPU from '../assets/img/CPU.png';
import RAM from '../assets/img/RAM.png';
import ROM from '../assets/img/ROM.png';
import LoadingIndicator from './LoadingIndicator';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);
    const [cookies] = useCookies(['jwtToken']);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams(); // Получаем ID пользователя из параметров URL

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

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/orders/user/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setOrders(data);
            } catch (fetchError) {
                console.error("Ошибка при получении заказов:", fetchError);
                setError("Ошибка при загрузке заказов.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [id]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <section className="container order">
            <h1>Заказы пользователя с ID: {id}</h1>
            {isLoading ? (
                <LoadingIndicator />
            ) : (
                orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.id} className="two_user">
                            <div className='txt1'>
                                <div><strong>ID заказа:</strong> {order.id}</div>
                                <div><strong>Статус заказа:</strong> {order.status}</div>
                                <div><strong>Сумма заказа:</strong> {order.totalAmount} ₽</div>
                                <div><strong>Количество товаров:</strong> {order.quantity}</div>
                                <div><strong>Адрес доставки:</strong> {order.deliveryAddress}</div>
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
                                                        <div>Кол-во: {order.orderProducts?.find(op => op.productId === product.id)?.quantity || 0}</div>
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
                    <div>У этого пользователя пока нет заказов.</div>
                )
            )}
        </section>
    );
};

export default UserOrders;

