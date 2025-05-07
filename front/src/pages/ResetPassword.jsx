// src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../style/ResetPassword.css';

const BASE_URL = 'http://localhost:8080';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Extract token from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setErrorMessage('Токен не найден. Пожалуйста, проверьте URL.');
        }
    }, [location]);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        if (!token) {
            setErrorMessage('Токен не найден. Пожалуйста, запросите новую ссылку для сброса пароля.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Пароли не совпадают');
            setLoading(false);
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(password)) {
            setErrorMessage('Пароль должен содержать минимум 6 символов и хотя бы одну букву и одну цифру.');
            setLoading(false);
            return;
        }

        try {
            // Make sure to match the field names expected by your backend
            const requestData = {
                token: token,
                password: password,
                confirmPassword: confirmPassword
            };
            
            console.log('Sending data:', requestData);
            
            const response = await fetch(`${BASE_URL}/api/password-reset/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                setSuccessMessage('Пароль успешно изменен. Сейчас вы будете перенаправлены на главную страницу.');
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                const data = await response.json();
                // Handle various error formats
                const errorMsg = data.message || 
                                 (data.error ? data.error : 
                                 (typeof data === 'object' ? Object.values(data).join(', ') : 
                                 'Не удалось сбросить пароль. Проверьте правильность ссылки или запросите новую.'));
                setErrorMessage(errorMsg);
            }
        } catch (error) {
            console.error('Error during password reset:', error);
            setErrorMessage('Ошибка сервера. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-form-wrapper">
                <h2>Сброс пароля</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                
                {!successMessage && (
                    <form onSubmit={handleSubmit} className="reset-password-form">
                        <div className="form-group">
                            <label htmlFor="password">Новый пароль</label>
                            <div className="password-input-container">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                />
                                <span 
                                    className="password-toggle-icon" 
                                    onClick={togglePasswordVisibility}
                                >
                                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Подтвердите пароль</label>
                            <div className="password-input-container">
                                <input
                                    type={confirmPasswordVisible ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                />
                                <span 
                                    className="password-toggle-icon" 
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={loading || !token}
                        >
                            {loading ? 'Обработка...' : 'Сбросить пароль'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
