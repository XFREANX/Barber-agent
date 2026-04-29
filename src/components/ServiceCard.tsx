import React from 'react';
import './ServiceCard.css';

interface ServiceProps {
  service: {
    _id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    image?: string;
  };
}

const ServiceCard: React.FC<ServiceProps> = ({ service }) => {
  return (
    <div className="service-card">
      <div className="service-image-container">
        <img 
          src={service.image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop'} 
          alt={service.name} 
          className="service-image"
        />
        <div className="service-price">${service.price}</div>
      </div>
      <div className="service-info">
        <h3 className="service-name">{service.name}</h3>
        <p className="service-description">{service.description}</p>
        <div className="service-footer">
          <span className="service-duration">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {service.duration} min
          </span>
          <button className="book-btn">Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
