import React, { useEffect, useState } from 'react';
import { fetchBarbers } from '../services/api';
import BarberCard from '../components/BarberCard';
import './BarbersPage.css';

interface Barber {
  _id: string;
  name: string;
  bio: string;
  image: string;
  specialties?: any[];
}

interface BarbersPageProps {
  onBook: (data: any) => void;
}

const BarbersPage: React.FC<BarbersPageProps> = ({ onBook }) => {
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBarbers = async () => {
      try {
        const data = await fetchBarbers();
        setBarbers(data);
      } catch (err) {
        setError('Failed to load barbers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBarbers();
  }, []);

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
