// src/components/AllOrders.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import "../style/Admin.css";
import GPU from "../assets/img/Videocard.png";
import CPU from "../assets/img/CPU.png";
import RAM from "../assets/img/RAM.png";
import ROM from "../assets/img/ROM.png";
import LoadingIndicator from "./LoadingIndicator";
import "../style/AllOrders.css";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { FaTrash } from "react-icons/fa";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [cookies] = useCookies(["jwtToken"]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [statuses, setStatuses] = useState([
    "формируется",
    "на обработке",
    "собирается",
    "доставляется",
    "доставлен",
    "завершен",
    "откланён",
  ]);
  const [loadingProducts, setLoadingProducts] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [firstNameSearch, setFirstNameSearch] = useState("");
  const [lastNameSearch, setLastNameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  // New state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const ORDERS_PER_PAGE = 5;

  // useCallback hook to memoize the fetchOrders function
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `http://localhost:8080/orders/all?page=${currentPage}&size=${ORDERS_PER_PAGE}`;
      const params = [];

      if (statusFilter) {
        params.push(`status=${statusFilter}`);
      }
      if (firstNameSearch) {
        params.push(`customerFirstName=${firstNameSearch}`);
      }
      if (lastNameSearch) {
        params.push(`customerLastName=${lastNameSearch}`);
      }
      if (emailSearch) {
        params.push(`customerEmail=${emailSearch}`);
      }
      if (phoneSearch) {
        params.push(`customerPhone=${phoneSearch}`);
      }

      if (params.length > 0) {
        url += `&${params.join("&")}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data.content);
      setPageCount(data.totalPages);
    } catch (fetchError) {
      console.error("Ошибка при получении заказов:", fetchError);
      setError("Ошибка при загрузке заказов.");
    } finally {
      setIsLoading(false);
    }
  }, [
    statusFilter,
    currentPage,
    firstNameSearch,
    lastNameSearch,
    emailSearch,
    phoneSearch,
  ]);

  useEffect(() => {
    if (cookies.jwtToken) {
      try {
        const decodedToken = jwtDecode(cookies.jwtToken);
        setCurrentUserId(decodedToken.userId);
      } catch (decodeError) {
        console.error("Ошибка при декодировании токена:", decodeError);
        setError("Ошибка аутентификации");
      }
    } else {
      setError("Пожалуйста, войдите.");
    }
  }, [cookies.jwtToken]);

  useEffect(() => {
    // Запускаем fetchOrders только после получения userId и установки currentPage
    if (currentUserId !== null) {
      fetchOrders();
    }
  }, [cookies.jwtToken, fetchOrders, currentUserId]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:8080/orders/${orderId}/status?status=${newStatus}`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (updateError) {
      console.error("Ошибка при обновлении статуса:", updateError);
      setError("Ошибка при обновлении статуса заказа.");
    }
  };

  // Modified to show confirmation dialog instead of directly deleting
  const confirmDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  // Actual delete function
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8080/orders/delete/${orderToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setOrders(orders.filter((order) => order.id !== orderToDelete));
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    } catch (deleteError) {
      console.error("Ошибка при удалении заказа:", deleteError);
      setError("Ошибка при удалении заказа.");
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("");
    setFirstNameSearch("");
    setLastNameSearch("");
    setEmailSearch("");
    setPhoneSearch("");
    setCurrentPage(0);
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  // Функция для получения количества конкретного товара в заказе через таблицу order_products
  const getProductQuantity = (order, productId) => {
    // Проверяем, что order и orderProducts существуют и orderProducts - массив
    if (order && order.orderProducts && Array.isArray(order.orderProducts)) {
      // Ищем запись для данного товара в таблице order_products
      const orderProduct = order.orderProducts.find(
        (op) => op.productId === productId
      );
      // Возвращаем количество, если запись найдена, иначе 0
      return orderProduct ? orderProduct.quantity : 0;
    }
    return 0;
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div id="admin">
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <div className="delete-confirmation-content">
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить заказ №{orderToDelete}?</p>
            <div className="delete-confirmation-buttons">
              <button onClick={handleDeleteOrder} className="confirm-button">
                Да, удалить
              </button>
              <button onClick={cancelDelete} className="cancel-button">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="admin_button">
        <span className="Link">
          <Link to="/admin" className="Link">
            Пользователи
          </Link>
        </span>
        <span className="Link_activ">Заказы</span>
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
        <span className="Link">
          <Link to="/admin/service-orders" className="Link">
            Заявки
          </Link>
        </span>
      </h3>
      <div className="filters">
        <label>
          <span>Фильтр по статусу:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Все статусы</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Поиск по имени:</span>
          <input
            type="text"
            value={firstNameSearch}
            onChange={(e) => setFirstNameSearch(e.target.value)}
            placeholder="Имя"
          />
        </label>
        <label>
          <span>Поиск по фамилии:</span>
          <input
            type="text"
            value={lastNameSearch}
            onChange={(e) => setLastNameSearch(e.target.value)}
            placeholder="Фамилия"
          />
        </label>
        <label>
          <span>Поиск по email:</span>
          <input
            type="text"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            placeholder="Email"
          />
        </label>
        <label>
          <span>Поиск по телефону:</span>
          <input
            type="text"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="Телефон"
          />
        </label>
        <button className="clear-filters-button" onClick={clearFilters}>
          Очистить фильтры
        </button>
      </div>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div className="one_zakaz" key={order.id}>
                <button
                  className="delete delete_orders_admin"
                  onClick={() => confirmDeleteOrder(order.id)}
                >
                  <span>
                    <FaTrash />
                  </span>{" "}
                </button>
                <div className="txt_admin">
                  <div>
                    ID: <div>{order.id}</div>
                  </div>
                  <div>
                    Статус:
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    Сумма: <div>{order.totalAmount} ₽</div>
                  </div>
                  <div>
                    Заказчик:
                    <div className="not_upper">
                      {order.customerLastName} {order.customerFirstName} (
                      {order.customerEmail}, {order.customerPhone})
                    </div>
                  </div>
                  <div>
                    Количество товаров: <div>{order.quantity}</div>
                  </div>
                  <div>
                    Адрес доставки: <div>{order.deliveryAddress}</div>
                  </div>
                  <button onClick={() => toggleOrder(order.id)}>
                    {expandedOrders[order.id]
                      ? "Скрыть товары"
                      : "Показать товары"}
                  </button>
                </div>
                {loadingProducts[order.id] ? (
                  <LoadingIndicator />
                ) : (
                  expandedOrders[order.id] && (
                    <div className="carti_tovarov">
                      {order.products && order.products.length > 0 ? (
                        order.products.map((product) => (
                          <div className="card_tovara_orders" key={product.id}>
                            {product.image ? (
                              <img
                                src={`data:image/png;base64, ${product.image}`}
                                alt={product.productName}
                                className="name price bue"
                              />
                            ) : (
                              <div>No Image</div>
                            )}
                            <div className="name_price_bue">
                              <h4>{product.productName}</h4>
                              <div>
                                <div>
                                  Кол-во:{" "}
                                  {getProductQuantity(order, product.id)}
                                </div>
                                <div>{product.price} ₽</div>
                              </div>
                            </div>
                            <div className="konfi">
                              <div className="konfiguration">
                                <img src={GPU} alt="Видеокарта" />
                                <div>
                                  <div>Видеокарта</div>
                                  <div>{product.videoCard}</div>
                                </div>
                              </div>
                              <div className="konfiguration">
                                <img src={CPU} alt="Процессор" />
                                <div>
                                  <div>Процессор</div>
                                  <div>{product.processor}</div>
                                </div>
                              </div>
                              <div className="konfiguration">
                                <img src={RAM} alt="Оперативная память" />
                                <div>
                                  <div>Оперативная память</div>
                                  <div>{product.ram} Гб</div>
                                </div>
                              </div>
                              <div className="konfiguration">
                                <img src={ROM} alt="Постоянная память" />
                                <div>
                                  <div>Постоянная память</div>
                                  <div>{product.storage}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div>Товары не найдены</div>
                      )}
                    </div>
                  )
                )}
              </div>
            ))
          ) : (
            <div>Заказы не найдены</div>
          )}
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            forcePage={currentPage}
          />
        </>
      )}
    </div>
  );
};

export default AllOrders;
