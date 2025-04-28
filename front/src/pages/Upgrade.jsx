import React, { useState, useEffect } from 'react';
import image_upgrade from "../assets/img/Upgrade.png";
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import '../style/Upgrade.css'; // Ensure this is imported

function Upgrade() {
    const [services, setServices] = useState([]);
    const [budget, setBudget] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [comment, setComment] = useState('');
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);
    const [cookies] = useCookies(['jwtToken']);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        // Get userId from the token stored in cookies
        if (cookies.jwtToken) {
            try {
                const decodedToken = jwtDecode(cookies.jwtToken);
                setUserId(decodedToken.userId);
            } catch (error) {
                console.error("Ошибка при декодировании токена:", error);
                setError("Ошибка при аутентификации.");
            }
        } else {
            setError('');
        }

        const fetchServices = async () => {
            try {
                const response = await fetch("http://localhost:8080/services/getAll");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error("Ошибка при получении данных:", error);
                setError("Ошибка при загрузке услуг.");
            }
        };

        fetchServices();
    }, [cookies.jwtToken]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!userId) {
            setError('User ID не установлен. Пожалуйста, войдите.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/service-orders/user/${userId}/service/${selectedServiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    price: budget,
                    comment: comment
                })
            });

            if (response.ok) {
                console.log('Заявка успешно отправлена!');
                setBudget('');
                setSelectedServiceId(null);
                setComment('');
                setError(null);
                setSuccessMessage('Заявка успешно отправлена!');
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 2000);
            } else {
                console.error('Ошибка при отправке заявки:', response.status);
                setError(`Ошибка при отправке заявки: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            setError('Ошибка сети');
        }
    };

    return (
        <div>
             {successMessage && (
                <div className="success-notification">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="error-notification">
                    {error}
                </div>
            )}
            <section id="upsect1">
                <div>
                    <h1>
                        Добро пожаловать в <span>апгрейт-центр</span>
                    </h1>
                    <p>
                        Здесь вы найдете <span>все необходимое</span> для того, чтобы ваш
                        компьютер работал <span>на максимальной мощности</span>. Мы
                        предлагаем широкий ассортимент комплектующих и аксессуаров, которые
                        помогут вам <span>улучшить производительность</span>, увеличить
                        объем памяти или обновить графику вашего ПК.
                    </p>
                    <p>
                        Наши специалисты всегда готовы помочь вам с выбором и установкой
                        компонентов, <span>чтобы вы могли наслаждаться</span> безупречной
                        работой вашего компьютера.
                    </p>
                    <p>
                        <span>Независимо</span> от того, являетесь ли вы
                        <span> геймером, дизайнером </span> или
                        <span> просто хотите ускорить повседневные задачи</span>, у нас есть
                        решения <span>для всех ваших нужд</span>. Начните свой апгрейд уже
                        сегодня и ощутите разницу!
                    </p>
                </div>
                <img src={image_upgrade} alt=""/>
            </section>
            <section id="upsect2">
                {!userId ? (
                    <div>Пожалуйста, авторизируйтесь, чтобы оставить заявку.</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="one">
                            <h2>
                                Заполните анкету на <span>апгрейд</span>
                            </h2>
                            <div className="budj">
                                <div>бюджет</div>
                                <input
                                    required
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                />
                            </div>
                            <div className="cel">
                                <div>цель апгрейда</div>
                                <select
                                    name="service"
                                    id="service"
                                    value={selectedServiceId || ''}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    required
                                >
                                    <option value="">Выберите услугу</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.serviceName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="krasivaa_knopka">
                                <span>Отправить заявку</span>
                            </button>
                        </div>
                        <div className="two">
                            <div>комментарий пользователя</div>
                            <textarea
                                name="comment"
                                required
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}

export default Upgrade;
