// File path: [front\src\components\Header.jsx](file:///C:\Users\elfir\OneDrive\Рабочий стол\CoursWork-main\front\src\components\Header.jsx)
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import "../style/Header.css";
import logo from "../assets/img/logo.png";
import { jwtDecode } from 'jwt-decode';
import { useCookies } from 'react-cookie';
import { FiShoppingCart } from 'react-icons/fi';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

const BASE_URL = 'http://localhost:8080';

const Header = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['jwtToken']);
    const [phone, setPhone] = useState('+7');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (cookies.jwtToken) {
            setIsLoggedIn(true);
            try {
                const decodedToken = jwtDecode(cookies.jwtToken);
                setUserRole(decodedToken.role);
            } catch (decodeError) {
                console.error("Ошибка при декодировании токена:", decodeError);
                setErrorMessage('Ошибка при декодировании токена.');
                setIsLoggedIn(false);
                removeCookie('jwtToken', { path: '/' });
            }
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
        }
    }, [cookies.jwtToken, removeCookie, setCookie]);

    useEffect(() => {
        if (isLoggedIn) {
            const timeoutId = setTimeout(() => {
                handleLogout();
                window.location.reload();
            }, 3600000);

            return () => clearTimeout(timeoutId);
        }
    }, [isLoggedIn]);

    const toggleAuthModal = () => {
        setIsAuthModalOpen(!isAuthModalOpen);
    };

    const showLoginForm = () => {
        setIsLoginFormVisible(true);
        setErrorMessage(null);
    };

    const showRegisterForm = () => {
        setIsLoginFormVisible(false);
        setErrorMessage(null);
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                setCookie('jwtToken', data.token, { path: '/', maxAge: 1800 });

                try {
                    const decodedToken = jwtDecode(data.token);
                    setUserRole(decodedToken.role);
                } catch (decodeError) {
                    console.error("Ошибка при декодировании токена:", decodeError);
                    setErrorMessage('Ошибка при декодировании токена.');
                }

                setIsAuthModalOpen(false);
                setIsLoggedIn(true);
            } else {
                // Общее сообщение об ошибке для неверного email или пароля
                setErrorMessage('Почта или пароль неверные');
            }
        } catch (error) {
            setErrorMessage('Ошибка сети');
        }
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const firstName = form.querySelector('input[name="firstName"]').value;
        const lastName = form.querySelector('input[name="lastName"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        let phoneValue = phone.replace(/\D/g, '');
        if (!phoneValue.startsWith('+7')) {
            phoneValue = '+7' + phoneValue.slice(1);
        }

        if (password !== confirmPassword) {
            setErrorMessage('Пароли не совпадают');
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(password)) {
            setErrorMessage('Пароль должен содержать минимум 6 символов и хотя бы одну букву и одну цифру.');
            return;
        }

        if (phoneValue.length !== 12) {
            setErrorMessage('Номер телефона должен содержать 11 цифр');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    phone: phoneValue
                })
            });
            console.log("Registration response:", response);

            if (response.ok) {
                setIsLoginFormVisible(true);
                setErrorMessage(null);
                setIsAuthModalOpen(true);
            } else {
                try {
                    const errorData = await response.json();
                    console.error("Registration error data:", errorData);
                    setErrorMessage(errorData.message || 'Ошибка регистрации');
                } catch (parseError) {
                    console.error("Error parsing error response:", parseError);
                    setErrorMessage('Не удалось обработать ответ от сервера');
                }
            }

        } catch (error) {
            console.error("Registration failed:", error);
            setErrorMessage('Ошибка сети');
        }
    };

    const handleLogout = () => {
        removeCookie('jwtToken', { path: '/' });
        setIsLoggedIn(false);
        setUserRole(null);
    };

    const formatPhoneNumber = useCallback((value) => {
        let cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 0) return "+7";

        let formattedNumber = '+7';
        if (cleaned.length > 1) {
            formattedNumber += ' (' + cleaned.substring(1, 4);
            if (cleaned.length > 4) {
                formattedNumber += ') ' + cleaned.substring(4, 7);
                if (cleaned.length > 7) {
                    formattedNumber += '-' + cleaned.substring(7, 9);
                    if (cleaned.length > 9) {
                        formattedNumber += '-' + cleaned.substring(9, 11);
                    }
                }
            }
        }

        return formattedNumber;
    }, []);

    const handlePhoneChange = (event) => {
        const rawValue = event.target.value;
        const formattedValue = formatPhoneNumber(rawValue);
        setPhone(formattedValue);
    };
  
    // Function to handle navigation and close the menu
    const handleNavClick = (route) => {
        setExpanded(false);
        navigate(route);
    };

    return (
        <header>
            <Navbar bg="#191a1b" expand="lg" expanded={expanded}>
                <Container>
                    <Navbar.Brand as={Link} to="/"  onClick={() => handleNavClick("/")}>
                        <img src={logo} alt="logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)}/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto d-flex align-items-center ">
                            <Nav.Link as={Link} to="/Catalog" className='text-white txt-up fw-bold' onClick={() => handleNavClick("/catalog")}>Каталог</Nav.Link>
                            <Nav.Link as={Link} to="/upgrade" className='text-white txt-up fw-bold' onClick={() => handleNavClick("/upgrade")}>Апгрейд</Nav.Link>
                             {isLoggedIn && userRole === 'ADMIN' && (
                                <Nav.Link as={Link} to="/admin" onClick={() => handleNavClick("/admin")} className='text-white txt-up fw-bold'>
                                    Админ панель
                                </Nav.Link>
                            )}
                        </Nav>
                        <Nav className='d-flex align-items-center'>
                            <Nav.Link as={Link} to="/basket" onClick={() => handleNavClick("/basket")}>
                                <FiShoppingCart className='imgheader' size={24} color="white" />
                            </Nav.Link>
                            <Nav.Link as={Link} to="/profile" onClick={() => handleNavClick("/profile")}>
                                <FaUser className='imgheader' size={24} color="white" />
                            </Nav.Link>
                            {isLoggedIn ? (
                                <>
                                   
                                    <button id="logoutBtn" className='vhodreg' onClick={handleLogout}>
                                        Выход
                                    </button>
                                </>
                            ) : (
                                <a href="#" id="loginBtn" className='vhodreg' onClick={toggleAuthModal}>
                                    Вход/Регистрация
                                </a>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            {isAuthModalOpen && (
                <div id="authModal" className="auth-modal" onClick={toggleAuthModal}>
                    <div className="auth-container" onClick={(e) => e.stopPropagation()}>
                        {isLoginFormVisible ? (
                            <form className="auth-form d-flex flex-column " id="loginForm" onSubmit={handleLoginSubmit}>
                                <h2>Вход</h2>
                                <input type="email" name="email" placeholder="Email" required />
                                <div className="password-input-container">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        name="password"
                                        placeholder="Пароль"
                                        required
                                    />
                                    <span
                                        className="password-toggle-icon"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <button type="submit" className='vhod'>Войти</button>
                                

                                <span onClick={showRegisterForm} className='text-light'>Нет аккаунта? <span
                                    className='text-cislota'>Зарегистрируйтесь</span></span>
                                    <div className="forgot-password">
    <Link to="/forgot-password" onClick={toggleAuthModal} className='text-cislota'>Забыли пароль?</Link>
</div>
                            </form>
                        ) : (
                            <form className="auth-form d-flex flex-column" id="registerForm"
                                onSubmit={handleRegisterSubmit}>
                                <h2>Регистрация</h2>
                                <input type="text" name="firstName" placeholder="Имя" required />
                                <input type="text" name="lastName" placeholder="Фамилия" required />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Номер телефона"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    required
                                />
                                <input type="email" name="email" placeholder="Email" required />
                                <div className="password-input-container">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        name="password"
                                        placeholder="Пароль"
                                        required
                                    />
                                    <span
                                        className="password-toggle-icon"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <div className="password-input-container">
                                    <input
                                        type={confirmPasswordVisible ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Подтвердите пароль"
                                        required
                                    />
                                    <span
                                        className="password-toggle-icon"
                                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                    >
                                        {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>

                                <button type="submit" className='vhod'>Зарегистрироваться</button>
                                <span onClick={showLoginForm} className='text-light'>Уже есть аккаунт? <span
                                    className='text-cislota'>Войти</span></span>
                            </form>
                        )}
                        {errorMessage && <div className="error-message text-danger">{errorMessage}</div>}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
