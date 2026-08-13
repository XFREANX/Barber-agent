import React, { useState, useMemo } from 'react';
import { useServices } from '../hooks/useServices';
import ServiceCard from '../components/ServiceCard';
import type { BookingInitialData } from '../types/index';
import './ServicesPage.css';

interface ServicesPageProps {
  onBook: (data: BookingInitialData) => void;
}

const PRICE_FILTERS = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: '< $20', min: 0, max: 20 },
  { label: '$20–$35', min: 20, max: 35 },
  { label: '> $35', min: 35, max: Infinity },
];

const DURATION_FILTERS = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: '< 30 min', min: 0, max: 30 },
  { label: '30–60 min', min: 30, max: 60 },
  { label: '> 60 min', min: 60, max: Infinity },
];

const ServicesPage: React.FC<ServicesPageProps> = ({ onBook }) => {
  const { services, loading, error } = useServices();
  const [search, setSearch] = useState('');
  const [priceIdx, setPriceIdx] = useState(0);
  const [durIdx, setDurIdx] = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const price = PRICE_FILTERS[priceIdx];
    const dur = DURATION_FILTERS[durIdx];
    return services.filter(s =>
      (s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) &&
      s.price >= price.min && s.price < price.max &&
      s.duration >= dur.min && s.duration < dur.max
    );
  }, [services, search, priceIdx, durIdx]);

  if (loading) {
    return (
      <div className="status-container">
        <div className="loader"></div>
        <p>Cargando servicios exclusivos...</p>
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
    <div className="services-page">
      <header className="services-header">
        <h1 className="title">Nuestros Servicios</h1>
        <p className="subtitle">Estilo impecable y cuidado profesional para el caballero moderno</p>
      </header>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar servicios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>×</button>
          )}
        </div>

        <div className="filter-group">
          <span className="filter-label">Precio:</span>
          <div className="filter-chips">
            {PRICE_FILTERS.map((f, i) => (
              <button
                key={f.label}
                className={`filter-chip ${priceIdx === i ? 'active' : ''}`}
                onClick={() => setPriceIdx(i)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Duración:</span>
          <div className="filter-chips">
            {DURATION_FILTERS.map((f, i) => (
              <button
                key={f.label}
                className={`filter-chip ${durIdx === i ? 'active' : ''}`}
                onClick={() => setDurIdx(i)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {(search || priceIdx !== 0 || durIdx !== 0) && (
          <button className="clear-all-btn" onClick={() => { setSearch(''); setPriceIdx(0); setDurIdx(0); }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {(search || priceIdx !== 0 || durIdx !== 0) && (
        <p className="results-count">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      <div className="services-grid">
        {filtered.length > 0 ? (
          filtered.map(service => (
            <ServiceCard
              key={service._id}
              service={service}
              onBook={() => onBook({ serviceId: service._id, serviceName: service.name })}
            />
          ))
        ) : (
          <p className="no-services">No hay servicios que coincidan con tu búsqueda.</p>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
