import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h1>404</h1>
        <h2>Corte No Encontrado</h2>
        <p>Parece que el estilo o la página que buscas no está en nuestro catálogo de hoy. ¡Volvamos a un lugar seguro!</p>
        <Link to="/" className="home-btn">
          Volver a Servicios
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
