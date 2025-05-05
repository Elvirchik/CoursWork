import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Footer.css'

const Footer = () => {
  return (
    <footer>
      <div className="foot container">
        <div className="txt-w">Политика конфиденциальности</div>
        <div>
          <Link to="/Contact">Контактная информация</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
