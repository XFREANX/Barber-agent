import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyAppointments, cancelMyAppointment } from '../services/api';
import type { Appointment, Service, Barber } from '../types/index';
import { formatPrice, formatDate } from '../utils/formatters';
import './MyAppointmentsPage.css';

const STATUS_MAP = {
  pending: { label: 'Pendiente', class: 'pending' },
  confirmed: { label: 'Confirmada', class: 'confirmed' },
  completed: { label: 'Completada', class: 'completed' },
  cancelled: { label: 'Cancelada', class: 'cancelled' },
};

export const MyAppointmentsPage: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'past'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyAppointments(token);
      setAppointments(data);
    } catch (err) {
      setError((err as Error).message || 'Error al cargar tus citas');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleCancel = async (id: string) => {
    if (!token) return;
    const confirmCancel = window.confirm('¿Estás seguro de que deseas cancelar esta cita?');
    if (!confirmCancel) return;

    try {
      setCancellingId(id);
      await cancelMyAppointment(token, id);
      setAppointments(prev =>
        prev.map(app => (app._id === id ? { ...app, status: 'cancelled' } : app))
      );
    } catch (err) {
      alert((err as Error).message || 'No se pudo cancelar la cita');
    } finally {
      setCancellingId(null);
    }
  };

  const getServiceName = (service: Service | string): string => {
    if (typeof service === 'object' && service !== null) return service.name;
    return 'Servicio de Barbería';
  };

  const getBarberName = (barber: Barber | string): string => {
    if (typeof barber === 'object' && barber !== null) return barber.name;
    return 'Barbero Asignado';
  };

  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'active') return app.status === 'pending' || app.status === 'confirmed';
    if (activeTab === 'past') return app.status === 'completed' || app.status === 'cancelled';
    return true;
  });

  return (
    <div className="my-appointments-page">
      <header className="appointments-header">
        <h1 className="title">Mis Citas Reservadas</h1>
        <p className="subtitle">Consulta el historial y estado de tus servicios reservados</p>
      </header>

      {/* Tabs */}
      <div className="appointments-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todas ({appointments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Próximas ({appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Historial / Canceladas ({appointments.filter(a => a.status === 'completed' || a.status === 'cancelled').length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="status-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loader"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando tus citas...</p>
        </div>
      ) : error ? (
        <div className="status-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p className="error-text">{error}</p>
          <button onClick={loadAppointments} className="btn-cancel" style={{ marginTop: '1rem' }}>
            Reintentar
          </button>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p>No tienes citas {activeTab !== 'all' ? 'en esta categoría' : 'registradas aún'}.</p>
          <Link to="/" className="btn-primary-link">
            Reservar una Cita
          </Link>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map(app => {
            const statusInfo = STATUS_MAP[app.status] || STATUS_MAP.pending;
            const canCancel = app.status === 'pending' || app.status === 'confirmed';

            return (
              <div key={app._id} className="appointment-card">
                <div className="card-top">
                  <div className="service-info">
                    <h3>{getServiceName(app.service)}</h3>
                    {app.totalPrice && <span className="price">{formatPrice(app.totalPrice)}</span>}
                  </div>
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="card-details">
                  <div className="detail-item">
                    <span className="icon">💈</span>
                    <span><strong>Barbero:</strong> {getBarberName(app.barber)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="icon">📅</span>
                    <span><strong>Fecha:</strong> {formatDate(app.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="icon">⏰</span>
                    <span><strong>Hora:</strong> {app.time}</span>
                  </div>
                  {app.notes && (
                    <div className="notes-box">
                      📝 "{app.notes}"
                    </div>
                  )}
                </div>

                {canCancel && (
                  <div className="card-actions">
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancel(app._id)}
                      disabled={cancellingId === app._id}
                    >
                      {cancellingId === app._id ? 'Cancelando...' : 'Cancelar Cita'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
