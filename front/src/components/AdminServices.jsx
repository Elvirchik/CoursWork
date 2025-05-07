// src/components/AdminServices.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import LoadingIndicator from "./LoadingIndicator";
import "../style/AdminServices.css"
import axios from "axios";
import { FaTrash} from "react-icons/fa";


const AdminServices = () => {
  const [cookies] = useCookies(["jwtToken"]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newService, setNewService] = useState({ serviceName: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/services", {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
        },
      });
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError(
        "Ошибка при загрузке услуг: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [cookies.jwtToken]);

  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить эту услугу?")) {
      try {
        await axios.delete(`http://localhost:8080/services/soft/${id}`, {
          headers: {
            Authorization: `Bearer ${cookies.jwtToken}`,
          },
        });
        setSuccessMessage("Услуга успешно удалена");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchServices();
      } catch (err) {
        setError(
          "Ошибка при удалении услуги: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/services/add", newService, {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
          "Content-Type": "application/json",
        },
      });
      setSuccessMessage("Услуга успешно добавлена");
      setTimeout(() => setSuccessMessage(""), 3000);
      setNewService({ serviceName: "" });
      setIsAdding(false);
      fetchServices();
    } catch (err) {
      setError(
        "Ошибка при добавлении услуги: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div id="admin">
      <h3 className="admin_button">
        <span>
          <Link to="/admin" className="Link">
            Пользователи
          </Link>
        </span>
        <span>
          <Link to="/admin/all/orders" className="Link">
            Заказы
          </Link>
        </span>
        <span>
          <Link to="/admin/products" className="Link">
            Товары
          </Link>
        </span>
        <span className="Link_activ">Услуги</span>
        <span className="Link">
          <Link to="/admin/service-orders" className="Link">
            Заявки
          </Link>
        </span>
      </h3>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="admin-actions mb-4">
        <button
          className="btn btn-success_admin"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? "Отменить" : "Добавить новую услугу"}
        </button>
      </div>

      {isAdding && (
        <div className="add-service-form">
          <form onSubmit={handleAddService}>
            <div className="form-group">
              <label htmlFor="serviceName">Название услуги:</label>
              <input
                type="text"
                id="serviceName"
                className="form-control"
                value={newService.serviceName}
                onChange={(e) =>
                  setNewService({ ...newService, serviceName: e.target.value })
                }
                required
                minLength="2"
                maxLength="100"
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Сохранить
            </button>
          </form>
        </div>
      )}

      <div className="services-list">
        <h4>Список доступных услуг</h4>
        {services.length === 0 ? (
          <p>Услуги не найдены</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название услуги</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{service.serviceName}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="btn btn-danger btn-sm btn_delete_orders"
                    >
                      <FaTrash />
                      <span>Удалить</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminServices;
