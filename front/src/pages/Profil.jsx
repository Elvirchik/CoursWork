// src/pages/Profil.jsx
import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import '../style/Profile.css';
import Orders from '../components/Orders';
import UpgradeRequests from '../components/UpgradeRequests'; // Import the new component
import AuthRequired from '../components/AuthRequired';
import { FaLock } from 'react-icons/fa';
    
const Profil = () => {
  const [cookies] = useCookies(['jwtToken']);
  const [userInfo, setUserInfo] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // Add state for tabs
  const [serviceOrders, setServiceOrders] = useState([]);
    
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
      setError('Пожалуйста, войдите.');
      setIsLoggedIn(false);
    }
  }, [cookies.jwtToken]);
    
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://localhost:8080/users/getOneById?id=${userId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const userData = await response.json();
          setUserInfo({
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
          });
        } catch (fetchError) {
          console.error("Ошибка при получении информации о пользователе:", fetchError);
          setError("Ошибка при загрузке данных пользователя.");
        }
      }
    };
    
    fetchUserInfo();
  }, [userId]);

  // Обновленный эффект для загрузки заявок на услуги
  useEffect(() => {
    const fetchServiceOrders = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://localhost:8080/service-orders/user/${userId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const orderData = await response.json();
          // Сохраняем полные данные заказов
          setServiceOrders(orderData);
        } catch (fetchError) {
          console.error("Ошибка при получении заявок на услуги:", fetchError);
        }
      }
    };
    
    if (activeTab === 'upgrades') {
      fetchServiceOrders();
    }
  }, [userId, activeTab]);
    
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'email') {
      setUserInfo(prevInfo => ({
        ...prevInfo,
        [name]: value
      }));
    }
  };
    
  const enableEditing = () => {
    setIsEditing(true);
  };
    
  const saveChanges = async () => {
    try {
      const updateData = { ...userInfo }; 
  
      const response = await fetch(`http://localhost:8080/users/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwtToken}`
        },
        body: JSON.stringify(updateData)
      });
  
    
      if (response.ok) {
        setIsEditing(false);
        setError(null);
        window.location.reload();
      } else {
        try {
          const errorData = await response.json();
          if (errorData.message) {
            setError(errorData.message);
          } else {
            setError('Ошибка при обновлении профиля');
          }
        } catch (parseError) {
          setError('Не удалось обработать ответ от сервера');
        }
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      setError('Ошибка сети при обновлении профиля.');
    }
  };
    
  if (!isLoggedIn) {
    return <AuthRequired message="Для просмотра профиля" />;
  }
    
  return (
    <section id='profil' className='container'>
      <h1>Ваш красивый профиль</h1>
      
      {/* Add tabs navigation */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
        <button 
          className={`tab-button ${activeTab === 'upgrades' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrades')}
        >
          Заявки на апгрейд
        </button>
      </div>
      
      {/* Profile information tab */}
      {activeTab === 'profile' && (
        <div className="one_user">
          {error && <div className="error-message">{error}</div>}
          <div>
            <div>Имя</div>
            <div className='pola'>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={userInfo.firstName}
                  onChange={handleChange}
                />
              ) : (
                <div>{userInfo.firstName}</div>
              )}
            </div>
          </div>
          <div>
            <div>Фамилия</div>
            <div className='pola'>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={userInfo.lastName}
                  onChange={handleChange}
                />
              ) : (
                <div>{userInfo.lastName}</div>
              )}
            </div>
          </div>
          <div>
            <div>Email</div>
            <div className='pola'>
              <div className='fjb'>
                {userInfo.email}
                <FaLock size={15} style={{ marginLeft: '5px' }} />
              </div>
            </div>
          </div>
          <div>
            <div>Телефон</div>
            <div className='pola'>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleChange}
                />
              ) : (
                <div>{userInfo.phone}</div>
              )}
            </div>
          </div>
          {isEditing ? (
            <button className="krasivaa_knopka" onClick={saveChanges}>
              <span>Сохранить изменения</span>
            </button>
          ) : (
            <button className="krasivaa_knopka" onClick={enableEditing}>
              <span>Изменить данные</span>
            </button>
          )}
        </div>
      )}
      
      {/* Orders tab */}
      {activeTab === 'orders' && <Orders />}
      
      {/* Upgrade requests tab */}
      {activeTab === 'upgrades' && <UpgradeRequests serviceOrders={serviceOrders} />}
    </section>
  );
};
    
export default Profil;
