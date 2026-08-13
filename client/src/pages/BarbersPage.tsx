import React, { useState, useMemo } from 'react';
import { useBarbers } from '../hooks/useBarbers';
import BarberCard from '../components/BarberCard';
import ReviewSection from '../components/ReviewSection';
import type { BookingInitialData } from '../types/index';
import './BarbersPage.css';

interface BarbersPageProps {
  onBook: (data: BookingInitialData) => void;
}

const BarbersPage: React.FC<BarbersPageProps> = ({ onBook }) => {
  const { barbers, loading, error } = useBarbers();
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [activeReviewBarberId, setActiveReviewBarberId] = useState<string | null>(null);

  // Extract unique list of specialties across all barbers
  const availableSpecialties = useMemo(() => {
    const specsSet = new Set<string>();
    barbers.forEach(b => {
      if (b.specialties && Array.isArray(b.specialties)) {
        b.specialties.forEach(spec => {
          const name = typeof spec === 'string' ? spec : spec?.name;
          if (name) specsSet.add(name);
        });
      }
    });
    return Array.from(specsSet);
  }, [barbers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return barbers.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(q) ||
        (b.bio?.toLowerCase().includes(q) ?? false);
      const matchesActive = !activeOnly || b.isActive;

      let matchesSpecialty = true;
      if (selectedSpecialty !== 'all') {
        matchesSpecialty = (b.specialties ?? []).some(spec => {
          const name = typeof spec === 'string' ? spec : spec?.name;
          return name === selectedSpecialty;
        });
      }

      return matchesSearch && matchesActive && matchesSpecialty;
    });
  }, [barbers, search, activeOnly, selectedSpecialty]);

  if (loading) {
    return (
      <div className="status-container">
        <div className="loader"></div>
        <p>Conociendo al equipo de élite...</p>
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

  const selectedBarberForReview = barbers.find(b => b._id === activeReviewBarberId);

  return (
    <div className="barbers-page">
      {/* Hero Header */}
      <header className="barbers-header">
        <div className="badge-pill">✂️ Equipo Profesional de Elite</div>
        <h1 className="title">Nuestros Maestros Barberos</h1>
        <p className="subtitle">Expertos apasionados dedicados al arte del peinado masculino y el cuidado tradicional.</p>
        
        {/* Quick Highlights */}
        <div className="barbers-stats">
          <div className="stat-item">
            <span className="stat-num">★ 4.9</span>
            <span className="stat-desc">Valoración Media</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">+1,500</span>
            <span className="stat-desc">Clientes Satisfechos</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">100%</span>
            <span className="stat-desc">Garantía de Estilo</span>
          </div>
        </div>
      </header>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre o especialidad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>×</button>
          )}
        </div>

        {/* Specialty Filter Chips */}
        {availableSpecialties.length > 0 && (
          <div className="filter-group">
            <span className="filter-label">Especialidad:</span>
            <div className="filter-chips">
              <button
                className={`filter-chip ${selectedSpecialty === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSpecialty('all')}
              >
                Todas
              </button>
              {availableSpecialties.map(spec => (
                <button
                  key={spec}
                  className={`filter-chip ${selectedSpecialty === spec ? 'active' : ''}`}
                  onClick={() => setSelectedSpecialty(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="filter-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={e => setActiveOnly(e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            Mostrar solo activos
          </label>
        </div>

        {(search || activeOnly || selectedSpecialty !== 'all') && (
          <button
            className="clear-all-btn"
            onClick={() => { setSearch(''); setActiveOnly(false); setSelectedSpecialty('all'); }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {(search || activeOnly || selectedSpecialty !== 'all') && (
        <p className="results-count">
          {filtered.length} barbero{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Barbers Grid */}
      <div className="barbers-grid">
        {filtered.length > 0 ? (
          filtered.map(barber => (
            <div key={barber._id} className="barber-card-wrapper">
              <BarberCard
                barber={barber}
                onBook={() => onBook({ barberId: barber._id, barberName: barber.name })}
              />
              <div className="card-actions">
                <button
                  className="review-btn"
                  onClick={() => setActiveReviewBarberId(barber._id)}
                >
                  ⭐ Ver u Opinión ({barber.name.split(' ')[0]})
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-barbers-box">
            <p className="no-barbers">No hay barberos que coincidan con los criterios seleccionados.</p>
          </div>
        )}
      </div>

      {/* Reviews Modal Drawer */}
      {activeReviewBarberId && selectedBarberForReview && (
        <div className="review-modal-overlay" onClick={() => setActiveReviewBarberId(null)}>
          <div className="review-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setActiveReviewBarberId(null)} aria-label="Cerrar modal">&times;</button>
            <div className="review-modal-header">
              <h3>Reseñas y Calificaciones</h3>
              <p>Conoce la opinión de los clientes sobre <strong>{selectedBarberForReview.name}</strong></p>
            </div>
            <ReviewSection
              barberId={selectedBarberForReview._id}
              barberName={selectedBarberForReview.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersPage;
