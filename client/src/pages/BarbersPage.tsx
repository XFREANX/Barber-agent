import React from 'react';
import { useBarbers } from '../hooks/useBarbers';
import BarberCard from '../components/BarberCard';
import type { BookingInitialData } from '../types/index';
import './BarbersPage.css';

interface BarbersPageProps {
  onBook: (data: BookingInitialData) => void;
}

const BarbersPage: React.FC<BarbersPageProps> = ({ onBook }) => {
  const { barbers, loading, error } = useBarbers();

  if (loading) {
    return (
      <div className="status-container">
        <div className="loader"></div>
        <p>Conociendo al equipo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-container">
        <p className="error-text">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="barbers-page">
      <header className="barbers-header">
        <h1 className="title">Nuestros Maestros</h1>
        <p className="subtitle">El talento detrás de cada corte perfecto.</p>
      </header>

      <div className="barbers-grid">
        {barbers.length > 0 ? (
          barbers.map(barber => (
            <BarberCard 
              key={barber._id} 
              barber={barber} 
              onBook={() => onBook({ barberId: barber._id, barberName: barber.name })} 
            />
          ))
        ) : (

          <p className="no-barbers">No hay barberos disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
};

export default BarbersPage;
