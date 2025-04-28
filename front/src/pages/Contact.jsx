import React, { useEffect, useRef } from 'react';

const Contact = () => {

  return (
    <div>
        <div className="kontact">
          <h4>наши контакты</h4>
          <div className="infa">
            <div>Адрес</div>
            <div>РТ, г. Альметьевск, ул. Ленина, 100.</div>
          </div>
          <div className="centr_infa">
            <div className="infa">
              <div>Контактный номер</div>
              <div>+ 7 (917) 390 06 06</div>
            </div>
            <div className="infa">
              <div>Сотрудничество</div>
              <div>PCForge@mail.ru</div>
            </div>
          </div>
          <div className="infa">
            <div>Работать у нас</div>
            <div>PCForge_raboraunas@mail.ru</div>
          </div>
        </div>
        <div className='map'>
        <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3A98a3ca846bafa69161588e80fac6871d72092c5dcb107697ee24e41f106df089&amp;source=constructor" width="100%" height="400" frameborder="0"></iframe>
        </div>
    </div>
  );
};

export default Contact;
