// src/components/AdminMenu.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import '../style/AdminMenu.css';

const AdminMenu = () => {
    const location = useLocation();
    const path = location.pathname;

    return (
        <div className="admin-menu">
            <h3 className='admin_button'>
                <span className={path === '/admin' ? 'Link_activ' : 'Link'}>
                    <Link to="/admin" className='Link'>Пользователи</Link>
                </span>
                <span className={path.includes('/admin/orders') || path === '/admin/orders' ? 'Link_activ' : 'Link'}>
                    <Link to="/admin/orders" className='Link'>Заказы</Link>
                </span>
                <span className={path.includes('/admin/products') ? 'Link_activ' : 'Link'}>
                    <Link to="/admin/products" className='Link'>Товары</Link>
                </span>
            </h3>
        </div>
    );
};

export default AdminMenu;
