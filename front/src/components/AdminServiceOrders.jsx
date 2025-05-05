import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import LoadingIndicator from "./LoadingIndicator";
import ReactPaginate from "react-paginate";
import { FaTrash, FaEdit, FaFilter, FaTimes } from "react-icons/fa";
import "../style/AdminServiceOrders.css";
import { Link } from "react-router-dom";

const AdminServiceOrders = () => {
  const [cookies] = useCookies(["jwtToken"]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [users, setUsers] = useState({}); // Store user data by ID
  const [services, setServices] = useState({}); // Store service data by ID
  const [servicesArray, setServicesArray] = useState([]); // Array for dropdown
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
  
  // Фильтры
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

      const usersData = await usersResponse.json();
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
      setServicesArray(servicesData); // Сохраняем массив для выпадающего списка
      
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

  // Загрузка всех заявок на услуги с фильтрами
  const fetchServiceOrders = async () => {
    try {
      setLoading(true);

      // First load users and services data if not loaded yet
      if (Object.keys(users).length === 0 || Object.keys(services).length === 0) {
        await fetchUserAndServiceData();
      }

      // Построение URL с параметрами фильтрации - используем новый endpoint all-simple
      let url = "http://localhost:8080/service-orders/all-simple";
      const params = [];
      
      if (firstNameFilter) params.push(`firstName=${encodeURIComponent(firstNameFilter)}`);
      if (lastNameFilter) params.push(`lastName=${encodeURIComponent(lastNameFilter)}`);
      if (serviceFilter) params.push(`serviceId=${serviceFilter}`);
      if (dateFilter) params.push(`createdDate=${encodeURIComponent(dateFilter)}`);
      params.push(`page=${currentPage}`);
      params.push(`size=${itemsPerPage}`);
      
      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      // Then load service orders with filters
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при загрузке заявок на услуги");
      }

      const data = await response.json();
      
      // Получаем данные с пагинацией из ответа
      setServiceOrders(data.content);
      setPageCount(data.totalPages);
      
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке заявок на услуги:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Вызываем загрузку заявок при изменении фильтров или страницы
  useEffect(() => {
    if (cookies.jwtToken) {
      fetchServiceOrders();
    }
  }, [currentPage, firstNameFilter, lastNameFilter, serviceFilter, dateFilter]);

  useEffect(() => {
    if (cookies.jwtToken) {
      try {
        const decodedToken = jwtDecode(cookies.jwtToken);
        if (decodedToken.role === "ADMIN") {
          fetchUserAndServiceData();
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

  // Очистка всех фильтров
  const clearFilters = () => {
    setFirstNameFilter("");
    setLastNameFilter("");
    setServiceFilter("");
    setDateFilter("");
    setCurrentPage(0);
  };

  // Изменение страницы пагинации
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
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

  // Применение фильтров
  const applyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(0); // Сбрасываем на первую страницу при применении фильтров
    fetchServiceOrders();
  };

  if (loading && Object.keys(services).length === 0) {
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
      
      {/* Кнопка для отображения/скрытия фильтров */}
      <div className="filter-toggle">
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="btn btn-filter"
        >
          <FaFilter /> {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </button>
      </div>
      
      {/* Фильтры */}
      {showFilters && (
        <div className="filters-panel">
          <form onSubmit={applyFilters} className="filters-form">
            <div className="filter-group">
              <label>Имя:</label>
              <input
                type="text"
                value={firstNameFilter}
                onChange={(e) => setFirstNameFilter(e.target.value)}
                placeholder="Имя пользователя"
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Фамилия:</label>
              <input
                type="text"
                value={lastNameFilter}
                onChange={(e) => setLastNameFilter(e.target.value)}
                placeholder="Фамилия пользователя"
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Услуга:</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Все услуги</option>
                {servicesArray.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.serviceName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Дата создания:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-actions">
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                <FaTimes /> Очистить
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingIndicator />
      ) : serviceOrders.length === 0 ? (
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
                {serviceOrders.map((order) => (
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
                    <td className="comment-cell">
                      {editOrderId === order.id ? (
                        <textarea
                          name="comment"
                          value={editedOrder.comment}
                          onChange={handleInputChange}
                          className="edit-textarea"
                        />
                      ) : (
                        <div className="comment-content">
                          {order.comment || "Нет комментария"}
                        </div>
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
                            <span>Редактировать</span> 
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="delete-btn-orders"
                            title="Удалить"
                          >
                            <FaTrash />
                            <span>Удалить</span>
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
