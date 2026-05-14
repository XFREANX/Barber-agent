import React from 'react';
import { useServices } from '../hooks/useServices';
import ServiceCard from '../components/ServiceCard';
import type { BookingInitialData } from '../types/index';
import './ServicesPage.css';

interface ServicesPageProps {
  onBook: (data: BookingInitialData) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onBook }) => {
  const { services, loading, error } = useServices();

  if (loading) {
    return (
      <div className="status-container">
        <div className="loader"></div>
        <p>Loading premium services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-container">
        <p className="error-text">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="services-page">
      <header className="services-header">
        <h1 className="title">Our Services</h1>
        <p className="subtitle">Meticulous grooming for the modern gentleman</p>
      </header>

      <div className="services-grid">
        {services.length > 0 ? (
          services.map(service => (
            <ServiceCard 
              key={service._id} 
              service={service} 
              onBook={() => onBook({ serviceId: service._id, serviceName: service.name })} 
            />
          ))
        ) : (

          <p className="no-services">No services found. Add some in the backend!</p>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
