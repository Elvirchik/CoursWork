import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import "../style/Admin.css";
import "../style/Catalog.css";
import GPU from "../assets/img/Videocard.png";
import CPU from "../assets/img/CPU.png";
import RAM from "../assets/img/RAM.png";
import ROM from "../assets/img/ROM.png";
import LoadingIndicator from "../components/LoadingIndicator";

const AdminProducts = () => {
  const [cookies] = useCookies(["jwtToken"]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/products/getAll`, {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Сетевая ошибка при загрузке товаров");
      }

      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке товаров:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Вы уверены, что хотите удалить этот товар?")) {
      try {
        const response = await fetch(
          `http://localhost:8080/products/delete/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${cookies.jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при удалении товара");
        }

        // Обновляем список товаров после удаления
        fetchData();
      } catch (error) {
        console.error("Ошибка при удалении товара:", error);
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [cookies.jwtToken]);

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
        <span className="Link_activ">Товары</span>
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
      <div className="admin-actions mb-4">
        <Link to="/admin/products/add" className="btn btn-success_admin">
          Добавить новый товар
        </Link>
      </div>
      <section>
        <div className="tovari">
          {products.map((computer) => (
            <div className="card_tovara" key={computer.id}>
              {computer.image ? (
                <img
                  src={`data:image/png;base64, ${computer.image}`}
                  alt={computer.productName}
                  className="name price bue"
                />
              ) : (
                <div>No Image</div>
              )}
              <div className="name_price_bue">
                <h4>{computer.productName}</h4>
                <div>
                  <div>{computer.price} ₽</div>
                </div>
              </div>
              <div className="konfi">
                <div className="konfiguration">
                  <img src={GPU} alt="Видеокарта" />
                  <div>
                    <div>Видеокарта</div>
                    <div>{computer.videoCard}</div>
                  </div>
                </div>
                <div className="konfiguration">
                  <img src={CPU} alt="Процессор" />
                  <div>
                    <div>Процессор</div>
                    <div>{computer.processor}</div>
                  </div>
                </div>
                <div className="konfiguration">
                  <img src={RAM} alt="Оперативная память" />
                  <div>
                    <div>Оперативная память</div>
                    <div>{computer.ram} Гб</div>
                  </div>
                </div>
                <div className="konfiguration">
                  <img src={ROM} alt="Постоянная память" />
                  <div>
                    <div>Постоянная память</div>
                    <div>{computer.storage} Тб</div>
                  </div>
                </div>
              </div>
              <div className="admin-buttons">
                <Link
                  to={`/admin/products/edit/${computer.id}`}
                  className="edit-btn"
                >
                  Редактировать
                </Link>
                <button
                  onClick={() => handleDelete(computer.id)}
                  className="delete-btn"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminProducts;
