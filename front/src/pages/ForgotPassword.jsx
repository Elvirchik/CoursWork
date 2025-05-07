// File path: [front\src\pages\ForgotPassword.jsx](file:///C:\Users\elfir\OneDrive\Рабочий стол\CoursWork-main\front\src\pages\ForgotPassword.jsx)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/password-reset/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.message) {
                    setError(data.message); // Display the backend message
                }
                setIsSubmitted(true);
            } else {
                setError(data.error || 'Произошла ошибка при отправке запроса');
            }
        } catch (error) {
            setError('Произошла ошибка при подключении к серверу');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Восстановление пароля</h2>

                {!isSubmitted ? (
                    <>
                        <p>Введите ваш email, и мы отправим вам ссылку для сброса пароля.</p>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
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
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Отправка...' : 'Отправить'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-message">
                        <p>
                            Инструкции по восстановлению пароля отправлены на адрес {email}.
                            Пожалуйста, проверьте вашу почту и следуйте инструкциям в письме.
                        </p>
                    </div>
                )}

                <div className="links">
                    <Link to="/" className="back-link">Вернуться на главную</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
