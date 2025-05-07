// src/components/RequestPasswordReset.jsx
import React, { useState } from 'react';
import '../style/RequestPasswordReset.css';

const BASE_URL = 'http://localhost:8080';

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`${BASE_URL}/auth/request-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Инструкции по сбросу пароля отправлены на ваш email.');
                setEmail('');
            } else {
                setErrorMessage(data.message || 'Не удалось отправить запрос на сброс пароля.');
            }
        } catch (error) {
            setErrorMessage('Ошибка сервера. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="request-reset-container">
            <div className="request-reset-form-wrapper">
                <h2>Восстановление пароля</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                
                <form onSubmit={handleSubmit} className="request-reset-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Введите ваш email"
                        />
                        <p className="form-hint">
                            Мы отправим ссылку для сброса пароля на ваш email.
                        </p>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={loading}
                    >
                        {loading ? 'Отправка...' : 'Отправить инструкции'}
                    </button>
                </form>
                
                <div className="back-to-login">
                    <a href="#" onClick={() => window.history.back()}>
                        Вернуться к входу
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RequestPasswordReset;
