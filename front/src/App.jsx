// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SectionOne from "./components/SectionOne";
import SectionTwo from "./components/SectionTwo";
import SectionThree from "./components/SectionThree";
import Catalog from "./pages/Catalog";
import Upgrade from "./pages/Upgrade";
import Contact from "./pages/Contact";
import Basket from "./pages/Basket";
import Profil from "./pages/Profil";
import Admin from "./pages/Admin";
import AuthRequired from "./components/AuthRequired";
import { CookiesProvider } from "react-cookie";
import UserOrders from "./components/UserOrders"; // Существующий компонент для пользователя
import UserOrdersAdmin from "./components/UserOrdersAdmin"; // Новый компонент для админа
import AllOrders from "./components/AllOrders";
import AdminProducts from "./components/AdminProducts"; // Импортируем новый компонент
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AdminServices from "./components/AdminServices";
import AdminServiceOrders from "./components/AdminServiceOrders";

const App = () => {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SectionOne />
                <SectionTwo />
                <SectionThree />
              </>
            }
          />
          <Route path="/Catalog" element={<Catalog />} />
          <Route path="/Upgrade" element={<Upgrade />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/basket" element={<Basket />} />
          <Route path="/profile" element={<Profil />} />
          <Route
            path="/admin"
            element={
              <AuthRequired message="Доступ к админ-панели разрешен только администраторам.">
                <Admin />
              </AuthRequired>
            }
          />
          <Route
            path="/admin/user/:id/orders"
            element={
              <AuthRequired message="Доступ к просмотру заказов разрешен только администраторам.">
                <UserOrdersAdmin />
              </AuthRequired>
            }
          />
          <Route
            path="/user/:id/orders"
            element={
              <AuthRequired message="Доступ к просмотру заказов разрешен только администраторам.">
                <UserOrders />
              </AuthRequired>
            }
          />
          <Route
            path="/admin/all/orders"
            element={
              <AuthRequired message="Доступ к просмотру всех заказов разрешен только администраторам.">
                <AllOrders />
              </AuthRequired>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AuthRequired message="Доступ к управлению товарами разрешен только администраторам.">
                <AdminProducts />
              </AuthRequired>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <AuthRequired message="Доступ к управлению товарами разрешен только администраторам.">
                <AddProduct />
              </AuthRequired>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <AuthRequired message="Доступ к управлению товарами разрешен только администраторам.">
                <EditProduct />
              </AuthRequired>
            }
          />
          <Route
            path="/admin/services"
            element={
              <AuthRequired message="Доступ к управлению товарами разрешен только администраторам.">
                <AdminServices />
              </AuthRequired>
            }
          />
          <Route
            path="/admin/service-orders"
            element={
              <AuthRequired message="Доступ к управлению заявками на услуги разрешен только администраторам.">
                <AdminServiceOrders />
              </AuthRequired>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </CookiesProvider>
  );
};

export default App;
