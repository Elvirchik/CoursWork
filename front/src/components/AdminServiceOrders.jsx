// src/components/AdminServiceOrders.jsx
import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import LoadingIndicator from "./LoadingIndicator";
import ReactPaginate from "react-paginate";
import { FaTrash, FaEdit } from "react-icons/fa";
import "../style/AdminServiceOrders.css";
import { Link } from "react-router-dom";

const AdminServiceOrders = () => {
  const [cookies] = useCookies(["jwtToken"]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [users, setUsers] = useState({}); // Store user data by ID
  const [services, setServices] = useState({}); // Store service data by ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [editOrderId, setEditOrderId] = useState(null);
  const [editedOrder, setEditedOrder] = useState({
    price: "",
    comment: "",
  });

  // Load user and service data
  const fetchUserAndServiceData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch(
        "http://localhost:8080/users/getAll?page=0&size=1000",
        {
          headers: {
            Authorization: `Bearer ${cookies.jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!usersResponse.ok) {
        throw new Error("Ошибка при загрузке пользователей");
      }

      const usersData = (await usersResponse.ok)
        ? await usersResponse.json()
        : { content: [] };
      const usersMap = {};
      usersData.content.forEach((user) => {
        usersMap[user.id] = user;
      });
      setUsers(usersMap);

      // Fetch services
      const servicesResponse = await fetch("http://localhost:8080/services", {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!servicesResponse.ok) {
        throw new Error("Ошибка при загрузке услуг");
      }

      const servicesData = await servicesResponse.json();
      const servicesMap = {};
      servicesData.forEach((service) => {
        servicesMap[service.id] = service;
      });
      setServices(servicesMap);
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователей и услуг:", error);
      setError("Не удалось загрузить данные пользователей и услуг");
    }
  };

  // Загрузка всех заявок на услуги
  const fetchServiceOrders = async () => {
    try {
      setLoading(true);

      // First load users and services data
      await fetchUserAndServiceData();

      // Then load service orders
      const response = await fetch("http://localhost:8080/service-orders/all", {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при загрузке заявок на услуги");
      }

      const data = await response.json();
      setServiceOrders(data);
      setPageCount(Math.ceil(data.length / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке заявок на услуги:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cookies.jwtToken) {
      try {
        const decodedToken = jwtDecode(cookies.jwtToken);
        if (decodedToken.role === "ADMIN") {
          fetchServiceOrders();
        } else {
          setError("Доступ разрешен только администраторам");
          setLoading(false);
        }
      } catch (error) {
        console.error("Ошибка декодирования токена:", error);
        setError("Ошибка авторизации");
        setLoading(false);
      }
    } else {
      setError("Необходима авторизация");
      setLoading(false);
    }
  }, [cookies.jwtToken]);

  // Get user info by ID
  const getUserInfo = (userId) => {
    if (!userId) return "Нет данных";
    const user = users[userId];
    return user ? `${user.firstName} ${user.lastName}` : `ID: ${userId}`;
  };

  const getServiceInfo = (serviceId) => {
    if (!serviceId) return "Нет данных";
    const service = services[serviceId];
    return service ? service.serviceName : `ID: ${serviceId}`;
  };

  // Изменение страницы пагинации
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  // Расчет текущей страницы для отображения
  const getCurrentItems = () => {
    const offset = currentPage * itemsPerPage;
    return serviceOrders.slice(offset, offset + itemsPerPage);
  };

  // Начать редактирование заявки
  const startEdit = (order) => {
    setEditOrderId(order.id);
    setEditedOrder({
      price: order.price,
      comment: order.comment,
    });
  };

  // Отменить редактирование
  const cancelEdit = () => {
    setEditOrderId(null);
    setEditedOrder({
      price: "",
      comment: "",
    });
  };

  // Сохранить изменения в заявке
  const saveChanges = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/service-orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.jwtToken}`,
          },
          body: JSON.stringify(editedOrder),
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось обновить заявку");
      }

      // Обновляем список заявок
      fetchServiceOrders();
      setEditOrderId(null);
    } catch (error) {
      console.error("Ошибка при обновлении заявки:", error);
      setError(error.message);
    }
  };

  // Мягкое удаление заявки
  const deleteOrder = async (orderId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту заявку?")) {
      try {
        const response = await fetch(
          `http://localhost:8080/service-orders/soft/${orderId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${cookies.jwtToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Не удалось удалить заявку");
        }

        // Обновляем список заявок
        fetchServiceOrders();
      } catch (error) {
        console.error("Ошибка при удалении заявки:", error);
        setError(error.message);
      }
    }
  };

  // Обработка изменений в форме редактирования
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <section className="container admin-service-orders">
      <h3 className="admin_button">
        <span className="Link">
        
            <Link to="/admin" className="Link">
              Пользователи
            </Link>
          
        </span>
        <span className="Link">
          <Link to="/admin/all/orders" className="Link">
            Заказы
          </Link>
        </span>
        <span className="Link">
          <Link to="/admin/products" className="Link">
            Товары
          </Link>
        </span>
        <span className="Link">
          <Link to="/admin/services" className="Link">
            Услуги
          </Link>
        </span>
        <span className="Link_activ">Заявки</span>
      </h3>

      <h2>Управление заявками на услуги</h2>

      {serviceOrders.length === 0 ? (
        <div className="no-orders">Заявки на услуги отсутствуют</div>
      ) : (
        <>
          <div className="service-orders-table-container">
            <table className="service-orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Пользователь</th>
                  <th>Услуга</th>
                  <th>Цена</th>
                  <th>Комментарий</th>
                  <th>Дата создания</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((order) => (
                  <tr key={order.id} className="service-order-row">
                    <td>{order.id}</td>
                    <td>{getUserInfo(order.userId)}</td>
                    <td>{getServiceInfo(order.serviceId)}</td>
                    <td>
                      {editOrderId === order.id ? (
                        <input
                          type="number"
                          name="price"
                          value={editedOrder.price}
                          onChange={handleInputChange}
                          className="edit-input"
                        />
                      ) : (
                        `${order.price} ₽`
                      )}
                    </td>
                    <td>
                      {editOrderId === order.id ? (
                        <textarea
                          name="comment"
                          value={editedOrder.comment}
                          onChange={handleInputChange}
                          className="edit-textarea"
                        />
                      ) : (
                        order.comment || "Нет комментария"
                      )}
                    </td>
                    <td>{new Date(order.createdWhen).toLocaleString()}</td>
                    <td className="action-buttons">
                      {editOrderId === order.id ? (
                        <>
                          <button
                            onClick={() => saveChanges(order.id)}
                            className="btn btn-success btn-sm"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="btn btn-secondary btn-sm"
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(order)}
                            className="edit-btn-orders"
                            title="Редактировать"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="delete-btn-orders"
                            title="Удалить"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <ReactPaginate
              breakLabel="..."
              nextLabel="Далее >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={pageCount}
              previousLabel="< Назад"
              renderOnZeroPageCount={null}
              containerClassName="pagination"
              pageLinkClassName="page-num"
              previousLinkClassName="page-num"
              nextLinkClassName="page-num"
              activeLinkClassName="active"
            />
          )}
        </>
      )}
    </section>
  );
};

export default AdminServiceOrders;
