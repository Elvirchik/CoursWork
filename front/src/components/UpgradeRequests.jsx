// src/components/UpgradeRequests.jsx
import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import '../style/UpgradeRequests.css';

const UpgradeRequests = () => {
    const [upgradeRequests, setUpgradeRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [cookies] = useCookies(['jwtToken']);

    useEffect(() => {
        if (cookies.jwtToken) {
            try {
                const decodedToken = jwtDecode(cookies.jwtToken);
                setUserId(decodedToken.userId);
            } catch (decodeError) {
                console.error("Ошибка при декодировании токена:", decodeError);
                setError("Ошибка аутентификации");
            }
        }
    }, [cookies.jwtToken]);

    useEffect(() => {
        const fetchUpgradeRequests = async () => {
            if (!userId) return;
            
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8080/service-orders/user/${userId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log("Получены данные:", data); // для отладки
                setUpgradeRequests(data);
                setError(null);
            } catch (fetchError) {
                console.error("Ошибка при получении заявок на услуги:", fetchError);
                setError("Не удалось загрузить заявки на услуги.");
            } finally {
                setLoading(false);
            }
        };

        fetchUpgradeRequests();
    }, [userId]);

    // Format date to a more readable format
    const formatDate = (dateString) => {
        if (!dateString) return 'Н/Д';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Определение класса CSS для статуса
    const getStatusClass = (status) => {
        if (!status) return 'unknown';
        
        const statusLower = status.toLowerCase();
        if (statusLower.includes('отмен')) return 'cancelled';
        if (statusLower.includes('обработке')) return 'processing';
        if (statusLower.includes('выполн')) return 'completed';
        if (statusLower.includes('ожидании')) return 'waiting';
        
        return 'default';
    };

    if (loading) {
        return <div className="loading">Загрузка заявок на услуги...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (upgradeRequests.length === 0) {
        return <div className="no-requests">У вас нет заявок на услуги</div>;
    }

    return (
        <div className="upgrade-requests-container">
            <h2>Ваши заявки на услуги</h2>
            <div className="upgrade-requests-list">
                {upgradeRequests.map((request) => {
                    // Используем статус напрямую из ответа API
                    const statusClass = getStatusClass(request.status);
                    
                    return (
                        <div key={request.id} className="upgrade-request-card">
                            <div className="request-header">
                                <h3>Заявка #{request.id}</h3>
                                <span className={`status ${statusClass}`}>
                                    {request.status || 'Статус неизвестен'}
                                </span>
                            </div>
                            <div className="request-details">
                                <p><strong>Услуга:</strong> {request.serviceName}</p>
                                <p><strong>Создана:</strong> {formatDate(request.createdWhen)}</p>
                                {request.comment && (
                                    <p><strong>Комментарий:</strong> {request.comment}</p>
                                )}
                                <p><strong>Стоимость:</strong> {request.price ? request.price.toLocaleString('ru-RU') : '0'} ₽</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UpgradeRequests;
