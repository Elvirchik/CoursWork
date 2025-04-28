import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import '../style/Catalog.css';
import '../style/Basket.css';
import GPU from '../assets/img/Videocard.png';
import CPU from '../assets/img/CPU.png';
import RAM from '../assets/img/RAM.png';
import ROM from '../assets/img/ROM.png';
import AuthRequired from '../components/AuthRequired';
import { Container, Row, Col } from 'react-bootstrap';
import LoadingIndicator from '../components/LoadingIndicator';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa'; // Import FaTrash icon

const Basket = () => {
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);
    const [cookies] = useCookies(['jwtToken']);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [orderSuccess, setOrderSuccess] = useState(null);

    useEffect(() => {
        if (cookies.jwtToken) {
            try {
                const decodedToken = jwtDecode(cookies.jwtToken);
                setUserId(decodedToken.userId);
                setIsLoggedIn(true);
            } catch (decodeError) {
                console.error("Ошибка при декодировании токена:", decodeError);
                setError("Ошибка аутентификации");
                setIsLoggedIn(false);
            }
        } else {
            setError("Пожалуйста, войдите.");
            setIsLoggedIn(false);
        }

        const fetchCartItems = async () => {
            setIsLoading(true);
            if (userId) {
                try {
                    const response = await fetch(`http://localhost:8080/carts/user/${userId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setCartItems(data);
                } catch (fetchError) {
                    console.error("Ошибка при получении данных корзины:", fetchError);
                    setError("Ошибка при загрузке корзины.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchCartItems();
    }, [cookies.jwtToken, userId]);

    const handleDeleteItem = async (productId) => {
        if (!productId) {
            console.error("Product ID is undefined");
            setError("Невозможно удалить товар: ID товара не определен.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/carts/user/${userId}/product/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const fetchCartItems = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/carts/user/${userId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setCartItems(data);
                } catch (fetchError) {
                    console.error("Ошибка при получении данных корзины:", fetchError);
                    setError("Ошибка при загрузке корзины.");
                }
            };
            fetchCartItems()
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
            setError('Ошибка при удалении товара из корзины.');
        }
    };

    const handleQuantityChange = async (item, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/carts/user/${userId}/product/${item.productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedCartItems = cartItems.map(cartItem =>
                cartItem.productId === item.productId ? { ...cartItem, quantity: newQuantity } : cartItem
            );
            setCartItems(updatedCartItems);
        } catch (error) {
            console.error('Ошибка при изменении количества товара: ', error);
            setError('Ошибка при изменении количества товара.');
        }
    };

    const handleIncrement = (item) => {
        handleQuantityChange(item, item.quantity + 1);
    };

    const handleDecrement = (item) => {
        if (item.quantity > 1) {
            handleQuantityChange(item, item.quantity - 1);
        }
    };

    const handleCheckout = async () => {
        if (!deliveryAddress) {
            setError('Пожалуйста, укажите адрес доставки.');
            return;
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        const orderProducts = cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        try {
            const response = await fetch(`http://localhost:8080/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    orderProducts: orderProducts,
                    totalAmount: totalAmount,
                    deliveryAddress: deliveryAddress,
                    quantity: totalQuantity,
                }),
            });

            if (response.ok) {
                console.log('Заказ успешно оформлен!');
                setError(null);
                setCartItems([]);
                setOrderSuccess('Заказ успешно оформлен!'); // Show success notification
                setTimeout(() => {
                    setOrderSuccess(null); // Clear notification after 3 seconds
                }, 3000);
            } else {
                console.error('Ошибка при оформлении заказа:', response.status);
                setError(`Ошибка при оформлении заказа: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            setError('Ошибка сети при оформлении заказа.');
        }
    };

    const totalCost = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (!isLoggedIn) {
        return <AuthRequired message="Для просмотра корзины" />;
    }

    return (
        <section className='container'>
            <h1 className='text-light'>Ваша корзина</h1>
            {orderSuccess && ( 
                <div className="notification">
                    {orderSuccess}
                </div>
            )}
            <div className="basket-container">
                {cartItems?.length > 0 && (
                    <div className="basket-summary text-light">
                        <p>Итоговая стоимость: <span className='kisli'>{totalCost}</span> ₽</p>
                        <p>Количество товаров: <span className='kisli'>{totalItems}</span></p>
                        <div className='adres'>
                            <div>Адрес доставки:</div>
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Введите адрес доставки"
                                required
                            />
                        </div>
                        <button className="checkout-button krasivaa_knopka_adres" onClick={handleCheckout}><span>Оформить заказ</span></button>
                    </div>
                )}
                 {isLoading ? (
                    <LoadingIndicator />
                ) : (
                    <div className="tovari_basket text-light">
                        {cartItems?.length > 0 ? (
                            cartItems.map(item => (
                                <div className="card_tovara" key={item?.productId}>
                                    {item?.image ? (
                                        <img
                                            src={`data:image/png;base64, ${item?.image}`}
                                            alt={item?.productName}
                                            className="name price bue"
                                        />
                                    ) : (
                                        <div>No Image</div>
                                    )}
                                    <div className="name_price_bue">
                                        <h4>{item?.productName ? item?.productName : 'Товар'}</h4>
                                        <div>{item?.price ? item?.price : 'Цена'} ₽</div>
                                    </div>
                                    <div className="konfi">
                                        <div className="konfiguration">
                                            <img src={GPU} alt="Видеокарта" />
                                            <div>
                                                <div>Видеокарта</div>
                                                <div>{item?.videoCard ? item?.videoCard : 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="konfiguration">
                                            <img src={CPU} alt="Процессор" />
                                            <div>
                                                <div>Процессор</div>
                                                <div>{item?.processor ? item?.processor : 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="konfiguration">
                                            <img src={RAM} alt="Оперативная память" />
                                            <div>
                                                <div>Оперативная память</div>
                                                <div>{item?.ram ? item?.ram : 'N/A'} Гб</div>
                                            </div>
                                        </div>
                                        <div className="konfiguration">
                                            <img src={ROM} alt="Постоянная память" />
                                            <div>
                                                <div>Постоянная память</div>
                                                <div>{item?.storage ? item?.storage : 'N/A'} Тб</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='kolvo_i_udalenie'>
                                    <div className='kol-vo'>
                                        <div className="quantity-controls">
                                            <button className="quantity-button" onClick={() => handleDecrement(item)}>-</button>
                                            <span>{item?.quantity}</span>
                                            <button className="quantity-button" onClick={() => handleIncrement(item)}>+</button>
                                        </div>
                                    </div>
                                    <button className='delete' onClick={() => handleDeleteItem(item.productId)}><span><FaTrash /></span> </button>
                                    </div>
                                    
                                </div>
                            ))
                        ) : (
                            <Container>
                                <Row>
                                    <Col md={{ span: 8, offset: 2 }} className="text-center">
                                        <div className="text-light" style={{ fontSize: '2em', marginTop: '20px' }}>
                                            Ваша корзина пуста.
                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                        )}
                    </div>
                )}
                </div>
        </section>
    );
};

export default Basket;
