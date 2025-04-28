import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Upgrade1 from '../assets/img/Upgrade.png';
import Upgrade2 from '../assets/img/Upgrade2.jpg';
import Upgrade3 from '../assets/img/Upgrade3.jpg';
import '../style/SectionThree.css';
import { Link } from 'react-router-dom'; // Import Link

const SectionThree = () => {
  const [activePanel, setActivePanel] = useState(0);

  const images = [
    Upgrade1,
    Upgrade2,
    Upgrade3
  ];

  const handlePanelClick = (index) => {
    setActivePanel(activePanel === index ? null : index);
  };

  return (
    <section id="sect3" className="container">
      <h1 className="txt-w h1_mej">
        Апгрейд центр.
        <div>Прокачай свой компьютер.</div>
      </h1>
      <div className="sect3 row">
        <div className="col-md-6">
          <div className="content">
            {[
              'Апгрейд компьютера',
              'Техническое обслуживание',
              'Моддинг',
            ].map((title, index) => (
              <div key={index}>
                <button
                  className={`accordion txt-w ${activePanel === index ? 'active' : ''}`}
                  onClick={() => handlePanelClick(index)}
                >
                  {title}
                  <span className="arrow">{activePanel === index ? '▲' : '▼'}</span> {/* Arrow */}
                </button>
                <div className={`panel ${activePanel === index ? 'active' : ''}`}>
                  <div>
                    {index === 0 && 'Подберем оптимальные комплектующие под задачи:'}
                    {index === 1 && 'Наши профессионалы позаботятся о вашем ПК:'}
                    {index === 2 && 'Реализуем все ваши самые интересные задумки по дизайну ПК:'}
                  </div>
                  <ul>
                    {index === 0 && (
                      <>
                        <li>Обновим видеокарту</li>
                        <li>Подберем новый процессор и материнскую плату</li>
                        <li>Увеличим объём оперативной памяти</li>
                        <li>Улучшим систему охлаждения</li>
                      </>
                    )}
                    {index === 1 && (
                      <>
                        <li>Сделаем профессиональную чистку системы компрессором</li>
                        <li>Заменим термоинтерфейс</li>
                        <li>Обслужим кастомное водяное охлаждение</li>
                        <li>Оптимизируем ОС и обновим драйвера</li>
                      </>
                    )}
                    {index === 2 && (
                      <>
                        <li>Нанесем винил по вашему эскизу</li>
                        <li>Используем автомобильную покраску в индивидуальных цветах</li>
                        <li>Сделаем профессиональную аэрографию</li>
                        <li>Установим кастомную систему охлаждения</li>
                      </>
                    )}
                  </ul>
                  <Link to="/upgrade">Узнать больше</Link>  {/* Corrected Link */}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div className="image-container">
            <img
              id="dynamicImage"
              src={images[activePanel !== null ? activePanel : 0]}
              alt="Компьютер"
              className="img-fluid"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionThree;
