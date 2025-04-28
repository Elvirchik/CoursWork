import React, { useState, useEffect, useCallback } from "react";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import "../style/Admin.css";
import AuthRequired from "../components/AuthRequired";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import LoadingIndicator from "../components/LoadingIndicator";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Сохраняем все пользователи для фильтрации
  const [error, setError] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
  });
  const [roles, setRoles] = useState([]);
  const [cookies] = useCookies(["jwtToken"]);
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // Состояние для модального окна подтверждения удаления
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Состояния для поиска
  const [firstNameSearch, setFirstNameSearch] = useState("");
  const [lastNameSearch, setLastNameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const USERS_PER_PAGE = 5;

  useEffect(() => {
    // Функция для декодирования JWT и установки роли пользователя
    const decodeToken = () => {
      if (cookies.jwtToken) {
        try {
          const decodedToken = jwtDecode(cookies.jwtToken);
          setUserRole(decodedToken.role);
          setCurrentUserId(decodedToken.userId);
        } catch (decodeError) {
          console.error("Ошибка при декодировании токена:", decodeError);
          setError("Ошибка аутентификации");
        }
      } else {
        setError("Пожалуйста, войдите.");
      }
    };

    decodeToken();
  }, [cookies.jwtToken]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/users/getAll?page=0&size=1000`
      ); // Получаем все пользователи для фильтрации
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Фильтруем, чтобы не показывать текущего пользователя
      const filteredUsers = data.content.filter(
        (user) => user.id !== currentUserId
      );
      setAllUsers(filteredUsers);
      setIsLoading(false);
    } catch (e) {
      setError("Ошибка при загрузке пользователей");
      console.error("Ошибка при загрузке пользователей:", e);
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:8080/roles/getAll");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRoles(data);
    } catch (e) {
      setError("Ошибка при загрузке ролей");
      console.error("Ошибка при загрузке ролей:", e);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchUsers();
      fetchRoles();
    }
  }, [currentUserId]);

  // Функция для фильтрации пользователей
  const filterUsers = useCallback(() => {
    if (!allUsers.length) return;

    let filtered = [...allUsers];

    // Фильтрация по имени
    if (firstNameSearch) {
      filtered = filtered.filter((user) =>
        user.firstName.toLowerCase().includes(firstNameSearch.toLowerCase())
      );
    }

    // Фильтрация по фамилии
    if (lastNameSearch) {
      filtered = filtered.filter((user) =>
        user.lastName.toLowerCase().includes(lastNameSearch.toLowerCase())
      );
    }

    // Фильтрация по email
    if (emailSearch) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(emailSearch.toLowerCase())
      );
    }

    // Фильтрация по телефону
    if (phoneSearch) {
      filtered = filtered.filter((user) => user.phone.includes(phoneSearch));
    }

    // Фильтрация по роли
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role.title === roleFilter);
    }

    // Пагинация на стороне клиента
    const offset = currentPage * USERS_PER_PAGE;
    const currentPageData = filtered.slice(offset, offset + USERS_PER_PAGE);

    setUsers(currentPageData);
    setPageCount(Math.ceil(filtered.length / USERS_PER_PAGE));
  }, [
    allUsers,
    firstNameSearch,
    lastNameSearch,
    emailSearch,
    phoneSearch,
    roleFilter,
    currentPage,
    USERS_PER_PAGE,
  ]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (user) => {
    setEditUserId(user.id);
    setEditedUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.id,
    });
  };

  // Обработчик для инициирования процесса удаления
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Функция для удаления пользователя после подтверждения
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8080/users/delete/${userToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setAllUsers(allUsers.filter((user) => user.id !== userToDelete.id));
        filterUsers(); // Обновляем отфильтрованный список
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      } else {
        setError("Не удалось удалить пользователя");
        setShowDeleteConfirm(false);
      }
    } catch (e) {
      setError("Ошибка при удалении пользователя");
      console.error("Ошибка при удалении пользователя:", e);
      setShowDeleteConfirm(false);
    }
  };

  // Функция для отмены удаления
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const selectedRole = roles.find(
        (role) => role.id === parseInt(editedUser.role)
      );

      if (!selectedRole) {
        setError("Выбранная роль не найдена");
        return;
      }

      const updatedUser = {
        ...editedUser,
        role: selectedRole, // Use the entire role object
      };

      const response = await fetch(
        `http://localhost:8080/users/update/${editUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );

      if (response.ok) {
        // Обновляем пользователя в списке всех пользователей
        const updatedAllUsers = allUsers.map((user) =>
          user.id === editUserId
            ? {
                ...user,
                firstName: editedUser.firstName,
                lastName: editedUser.lastName,
                email: editedUser.email,
                phone: editedUser.phone,
                role: selectedRole,
              }
            : user
        );
        setAllUsers(updatedAllUsers);
        filterUsers(); // Обновляем отфильтрованный список
        setEditUserId(null);
        setError(null);
      } else {
        setError("Не удалось сохранить изменения");
      }
    } catch (error) {
      setError("Ошибка при сохранении изменений");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditUserId(null);
  };

  // Функции для очистки полей поиска
  const clearFilters = () => {
    setFirstNameSearch("");
    setLastNameSearch("");
    setEmailSearch("");
    setPhoneSearch("");
    setRoleFilter("");
    setCurrentPage(0);
  };

  // Дополнительная проверка роли
  if (userRole !== "ADMIN") {
    return (
      <AuthRequired message="Доступ к админ-панели разрешен только администраторам." />
    );
  }

  return (
    <div id="admin">
      <h3 className="admin_button">
        <span className="Link_activ">Пользователи</span>
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
      </h3>

      {error && <div className="error-message">{error}</div>}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h4>Подтверждение удаления</h4>
            <p>
              Вы уверены, что хотите удалить пользователя{" "}
              {userToDelete.firstName} {userToDelete.lastName}?
            </p>
            <div className="confirmation-buttons">
              <button onClick={handleDelete} className="confirm-delete-btn">
                Удалить
              </button>
              <button onClick={cancelDelete} className="cancel-delete-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="search-panel">
        <div className="search-field">
          <label>Имя:</label>
          <input
            type="text"
            value={firstNameSearch}
            onChange={(e) => setFirstNameSearch(e.target.value)}
            placeholder="Введите имя"
          />
        </div>
        <div className="search-field">
          <label>Фамилия:</label>
          <input
            type="text"
            value={lastNameSearch}
            onChange={(e) => setLastNameSearch(e.target.value)}
            placeholder="Введите фамилию"
          />
        </div>

        <div className="search-field">
          <label>Email:</label>
          <input
            type="text"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            placeholder="Введите email"
          />
        </div>
        <div className="search-field">
          <label>Телефон:</label>
          <input
            type="text"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="Введите телефон"
          />
        </div>

        <div className="search-field">
          <label>Роль:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Все роли</option>
            {roles.map((role) => (
              <option key={role.id} value={role.title}>
                {role.title}
              </option>
            ))}
          </select>
        </div>
        <div className="search-actions">
          <button onClick={clearFilters} className="clear-button">
            Очистить фильтры
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {users.length === 0 ? (
            <div className="no-results">
              По вашему запросу ничего не найдено
            </div>
          ) : (
            users.map((user) => (
              <div className="one_zakaz" key={user.id}>
                {editUserId === user.id ? (
                  <div className="txt_admin">
                    <div>
                      Имя:
                      <input
                        type="text"
                        name="firstName"
                        value={editedUser.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      Фамилия:
                      <input
                        type="text"
                        name="lastName"
                        value={editedUser.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      Email:
                      <input
                        type="email"
                        name="email"
                        value={editedUser.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      Телефон:
                      <input
                        type="tel"
                        name="phone"
                        value={editedUser.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      Роль:
                      <select
                        name="role"
                        value={editedUser.role}
                        onChange={handleInputChange}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="buttons">
                      <button onClick={handleSave}>Сохранить</button>
                      <button onClick={handleCancel}>Отменить</button>
                    </div>
                  </div>
                ) : (
                  <div className="txt_admin">
                    <div>
                      ID: <div>{user.id}</div>
                    </div>
                    <div>
                      Имя: <div>{user.firstName}</div>
                    </div>
                    <div>
                      Фамилия: <div>{user.lastName}</div>
                    </div>
                    <div>
                      Email: <div>{user.email}</div>
                    </div>
                    <div>
                      Телефон: <div>{user.phone}</div>
                    </div>
                    <div>
                      Роль: <div>{user.role.title}</div>
                    </div>
                    <div className="buttons">
                      <button onClick={() => handleEdit(user)}>Изменить</button>
                      <button onClick={() => confirmDelete(user)}>
                        Удалить
                      </button>
                      <Link
                        to={`/admin/user/${user.id}/orders`}
                        className="show_order_admin"
                      >
                        Посмотреть заказы
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {users.length > 0 && (
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
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
