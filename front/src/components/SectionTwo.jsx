import React from 'react';
import kompikiImage from '../assets/img/kompiki.png';
import { Link } from 'react-router-dom'; // Import Link

const SectionTwo = () => {
  return (
    <section id="sect2">
      <h1 className="txt-w h1_mej">Выбери готовый компьютер мечты.</h1>
      <div className="sect2">
        <div>
          <h1 className="txt-w h1">
            В наличии пк <br />
            любого вида
          </h1>
          <div className="txt-w">с доставкой сегодня</div>
          <div>
            <Link // Use Link component
              to="/catalog" // Set the correct path
              className="txt-up krasivaa_knopka"
            >
              <span>Выбрать</span>
            </Link>
          </div>
        </div>
        <img src={kompikiImage} alt="" />
      </div>
    </section>
  );
};

export default SectionTwo;
