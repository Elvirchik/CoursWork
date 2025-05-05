// src/components/UserOrdersAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import GPU from '../assets/img/Videocard.png';
import CPU from '../assets/img/CPU.png';
import RAM from '../assets/img/RAM.png';
import ROM from '../assets/img/ROM.png';
import LoadingIndicator from './LoadingIndicator';
import '../style/UserOrdersAdmin.css';
import { FaTrash } from 'react-icons/fa';

const UserOrdersAdmin = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});
    const { id } = useParams(); // Получаем ID пользователя из параметров URL
    
    // Добавляем состояния для пагинации
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Загружаем заказы пользователя с пагинацией
                const ordersResponse = await fetch(`http://localhost:8080/orders/user/${id}?page=${currentPage}&size=${itemsPerPage}`);
                if (!ordersResponse.ok) {
                    throw new Error(`HTTP error! status: ${ordersResponse.status}`);
                }
                const ordersData = await ordersResponse.json();
                
                // Устанавливаем заказы и информацию о пагинации
                setOrders(ordersData.content || []);
                setPageCount(ordersData.totalPages || 0);
            } catch (fetchError) {
                console.error("Ошибка при загрузке данных:", fetchError);
                setError("Ошибка при загрузке данных.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, currentPage]); // Добавляем currentPage в зависимости

    // Обработчик изменения страницы
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const toggleOrder = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Функция для изменения статуса заказа
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:8080/orders/${orderId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Обновляем список заказов
            const updatedOrders = orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);
            
        } catch (error) {
            console.error("Ошибка при обновлении статуса заказа:", error);
            setError("Не удалось обновить статус заказа.");
        }
    };

    // Функция для удаления заказа
    const deleteOrder = async (orderId) => {
        if (window.confirm("Вы уверены, что хотите удалить этот заказ?")) {
            try {
                const response = await fetch(`http://localhost:8080/orders/delete/${orderId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Удаляем заказ из списка
                setOrders(orders.filter(order => order.id !== orderId));
                
                // Если мы удалили последний заказ на странице, перейдем на предыдущую страницу
                if (orders.length === 1 && currentPage > 0) {
                    setCurrentPage(currentPage - 1);
                }
                
            } catch (error) {
                console.error("Ошибка при удалении заказа:", error);
                setError("Не удалось удалить заказ.");
            }
        }
    };

    // Функция для получения количества конкретного товара в заказе
    const getProductQuantity = (order, productId) => {
        if (order && order.orderProducts && Array.isArray(order.orderProducts)) {
            const orderProduct = order.orderProducts.find(op => op.productId === productId);
            return orderProduct ? orderProduct.quantity : 0;
        }
        return 0;
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    // Извлекаем информацию о пользователе из первого заказа (если есть)
    const userInfo = orders.length > 0 && orders[0].user ? orders[0].user : null;

    return (
        <section className="container order">
            <h3 className='admin_button'>
                <span className='Link'><Link to="/admin" className='Link'>Пользователи</Link></span>
                <span className='Link_activ'>Заказы пользователя</span>
            </h3>
            
            {isLoading ? (
                <LoadingIndicator />
            ) : (
                <>
                    {userInfo && (
                        <div className="user-info">
                            <h2>Информация о пользователе</h2>
                            <p><strong>Имя:</strong> {userInfo.firstName} {userInfo.lastName}</p>
                            <p><strong>Email:</strong> {userInfo.email}</p>
                            <p><strong>Телефон:</strong> {userInfo.phone}</p>
                        </div>
                    )}

                    <h2>Заказы пользователя</h2>
                    {orders.length > 0 ? (
                        <>
                            {orders.map(order => (
                                <div key={order.id} className="UserOrdersAdmin">
                                    <div className='txt1'>
                                    <button 
                                        className="delete button_delete_orders_user"
                                        onClick={() => deleteOrder(order.id)}
                                    >
                                        <span><FaTrash /></span>
                                    </button>
                                        <div><strong>ID заказа:</strong> <span className='kisli'> {order.id}</span></div>
                                        <div><div className="status-actions">
                                                <div className='status_user_orders'><div>Статус:</div>
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="формируется">формируется</option>
                                                    <option value="на обработке">на обработке</option>
                                                    <option value="собирается">собирается</option>
                                                    <option value="доставляется">доставляется</option>
                                                    <option value="доставлен">доставлен</option>
                                                    <option value="завершен">завершен</option>
                                                    <option value="откланён">откланён</option>
                                                </select>
                                                </div></div>
                                        <div><strong>Сумма заказа:</strong> <span className='kisli'>{order.totalAmount}  ₽</span></div>
                                        <div><strong>Количество товаров:</strong><span className='kisli'> {order.quantity}</span></div>
                                        <div><strong>Адрес доставки:</strong><span className='kisli'> {order.deliveryAddress}</span> </div>
                                        <div className="order-actions">
                                            <button 
                                                className="toggle-btn" 
                                                onClick={() => toggleOrder(order.id)}
                                            >
                                                {expandedOrders[order.id] ? 'Скрыть товары' : 'Показать товары'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {expandedOrders[order.id] && (
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
                                                            <div className="no-image">Нет изображения</div>
                                                        )}
                                                        <div className="name_price_bue">
                                                            <h4>{product.productName}</h4>
                                                            <div>
                                                                <div>Кол-во: {getProductQuantity(order, product.id)}</div>
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
                                )}
                            </div>
                            ))}
                            
                            {/* Добавляем компонент пагинации */}
                            <ReactPaginate
                                previousLabel={'<'}
                                nextLabel={'>'}
                                breakLabel={'...'}
                                breakClassName={'break-me'}
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={handlePageClick}
                                containerClassName={'pagination'}
                                activeClassName={'active'}
                                forcePage={currentPage}
                            />
                        </>
                    ) : (
                        <div>У этого пользователя пока нет заказов.</div>
                    )}
                </>
            )}
        </section>
    );
};

export default UserOrdersAdmin;
