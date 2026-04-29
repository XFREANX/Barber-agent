import React from 'react';
import './BarberCard.css';

interface BarberProps {
  barber: {
    _id: string;
    name: string;
    bio: string;
    image: string;
    specialties?: any[];
  };
  onBook: () => void;
}

const BarberCard: React.FC<BarberProps> = ({ barber, onBook }) => {
  return (
    <div className="barber-card">
      <div className="barber-image-container">
        <img src={barber.image} alt={barber.name} className="barber-image" />
        <div className="barber-overlay">
          <button className="book-barber-btn" onClick={onBook}>
            Reservar con {barber.name.split(' ')[0]}
          </button>
        </div>
      </div>

      <div className="barber-info">
        <h3 className="barber-name">{barber.name}</h3>
        <p className="barber-bio">{barber.bio}</p>
        
        {barber.specialties && barber.specialties.length > 0 && (
          <div className="barber-specialties">
            {barber.specialties.map((spec, idx) => (
              <span key={idx} className="specialty-badge">
                {typeof spec === 'string' ? spec : spec.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarberCard;
