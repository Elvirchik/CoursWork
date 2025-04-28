// AuthRequired.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';

const AuthRequired = ({ children, message }) => {
  const [cookies] = useCookies(['jwtToken']);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (cookies.jwtToken) {
      try {
        const decodedToken = jwtDecode(cookies.jwtToken);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
        // Обработка ошибки декодирования токена
      }
    } else {
      setUserRole(null);
    }
  }, [cookies.jwtToken]);

  // Проверка роли пользователя
  if (userRole !== 'ADMIN') {
    return (
      <div style={{
        color: 'white',
        fontSize: '2em',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        {message || "У вас нет прав для просмотра этой страницы."} Войдите или Зарегистрируйтесь, чтобы продолжить.
      </div>
    );
  }

  return children; // Если роль ADMIN, отображаем дочерние компоненты
};

export default AuthRequired;
