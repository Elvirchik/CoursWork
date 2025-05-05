import React from 'react';
import photo1 from '../assets/img/komp.png';
import photo2 from '../assets/img/komp2.png';
import photo3 from '../assets/img/komp3.png';
import { Link } from 'react-router-dom';

const SectionOne = () => {
  return (
    <section id="sect1" className="">
      <div className="sect1_div row">
        <div className="col-md-12 text-center">
          <h1 className="txt-up txt-w h1">
            эталоны игровых <br />
            "монстров"
          </h1>
          <Link
            to="/catalog"
            className="btn  txt-up krasivaa_knopka"
          >
            <span>узнать больше</span>
          </Link>
        </div>
      </div>
      <div className="corusel">
        <div
          id="carouselExampleIndicators" 
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="3000" 
        >
          <div className="carousel-indicators"> 
            <button 
              type="button" 
              data-bs-target="#carouselExampleIndicators" 
              data-bs-slide-to="0" 
              className="active" 
              aria-current="true" 
              aria-label="Slide 1"
            ></button>
            <button 
              type="button" 
              data-bs-target="#carouselExampleIndicators" 
              data-bs-slide-to="1" 
              aria-label="Slide 2" 
            ></button>
            <button 
              type="button" 
              data-bs-target="#carouselExampleIndicators" 
              data-bs-slide-to="2" 
              aria-label="Slide 3" 
            ></button>
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src={photo1} className="d-block w-100 " alt="Image 1" />
            </div>
            <div className="carousel-item">
              <img src={photo2} className="d-block w-100" alt="Image 2" />
            </div>
            <div className="carousel-item">
              <img src={photo3} className="d-block w-100" alt="Image 3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionOne;
