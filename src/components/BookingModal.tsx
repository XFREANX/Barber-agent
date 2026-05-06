import React, { useState, useEffect, useCallback } from 'react';
import type { BookingInitialData, BookingFormData, Barber } from '../types/index';
import { fetchBarbers, createAppointment } from '../services/api';
import './BookingModal.css';

// ─── Sanitización defensiva ─────────────────────────────────────────────────

const sanitize = (input: string): string =>
  input.replace(/[<>]/g, '').trim();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d\s()-]{7,20}$/;

// ─── Estado inicial del formulario ──────────────────────────────────────────

const EMPTY_FORM: BookingFormData = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  service: '',
  barber: '',
};

// ─── Componente ─────────────────────────────────────────────────────────────

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BookingInitialData;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialData }) => {
  // BM4.2 — Estado sincronizado con initialData via useEffect
  const [formData, setFormData] = useState<BookingFormData>(EMPTY_FORM);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(false);

  // BM4.4 — Estados de loading y error durante el submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // BM4.6 — Estado de confirmación exitosa
  const [success, setSuccess] = useState(false);

  // BM4.2 — Sincronizar formulario cuando initialData cambia o el modal se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...EMPTY_FORM,
        service: initialData?.serviceId ?? '',
        barber: initialData?.barberId ?? '',
      });
      setSubmitError(null);
      setSuccess(false);
    }
  }, [isOpen, initialData]);

  // BM4.1 — Cargar barberos dinámicamente al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const loadBarbers = async () => {
      setLoadingBarbers(true);
      try {
        const data = await fetchBarbers();
        if (!cancelled) setBarbers(data);
      } catch {
        // Los mocks se cargan como fallback en fetchBarbers
      } finally {
        if (!cancelled) setLoadingBarbers(false);
      }
    };

    loadBarbers();
    return () => { cancelled = true; };
  }, [isOpen]);

  // BM4.5 — Reseteo completo al cerrar
  const handleClose = useCallback(() => {
    setFormData(EMPTY_FORM);
    setSubmitError(null);
    setSuccess(false);
    setSubmitting(false);
    onClose();
  }, [onClose]);

  // Actualización defensiva de campos
  const updateField = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitize(value) }));
    // Limpiar error anterior al editar
    if (submitError) setSubmitError(null);
  };

  // ─── Validación del lado del cliente ────────────────────────────────────

  const validate = (): string | null => {
    if (!formData.name || formData.name.length < 2) {
      return 'Por favor ingresa tu nombre completo (mínimo 2 caracteres).';
    }
    if (formData.name.length > 100) {
      return 'El nombre no puede exceder 100 caracteres.';
    }
    if (!formData.email || !EMAIL_REGEX.test(formData.email)) {
      return 'Por favor ingresa un email válido.';
    }
    if (!formData.phone || !PHONE_REGEX.test(formData.phone)) {
      return 'Por favor ingresa un teléfono válido.';
    }
    if (!formData.date) {
      return 'Por favor selecciona una fecha.';
    }
    // Validar que la fecha no sea pasada
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return 'La fecha no puede ser en el pasado.';
    }
    if (!formData.time) {
      return 'Por favor selecciona una hora.';
    }
    if (!formData.service) {
      return 'Por favor selecciona un servicio.';
    }
    if (!formData.barber) {
      return 'Por favor selecciona un barbero.';
    }
    return null;
  };

  // BM4.3 — Llamada real a createAppointment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación defensiva
    const validationError = validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    // Prevenir doble submit
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await createAppointment(formData);
      setSuccess(true);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Error inesperado al reservar. Intenta de nuevo.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // No renderizar si el modal está cerrado
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  // BM4.6 — Pantalla de confirmación exitosa
  if (success) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div 
          className="modal-content success-view" 
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="success-icon">✓</div>
          <h2 id="success-title">¡Reserva Confirmada!</h2>
          <p className="success-message">
            Tu cita ha sido registrada exitosamente. Te enviaremos una confirmación a <strong>{formData.email}</strong>.
          </p>
          <div className="success-details">
            <p><strong>Fecha:</strong> {formData.date}</p>
            <p><strong>Hora:</strong> {formData.time}</p>
            {initialData?.serviceName && (
              <p><strong>Servicio:</strong> {initialData.serviceName}</p>
            )}
          </div>
          <button className="submit-booking-btn" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        <button className="close-btn" onClick={handleClose} aria-label="Cerrar modal">&times;</button>
        
        <div className="modal-header">
          <h2 id="modal-title">Reserva tu Cita</h2>
          <p id="modal-desc">Selecciona el momento perfecto para tu cambio de look</p>
        </div>

        {/* Error global */}
        {submitError && (
          <div className="form-error" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form" noValidate>
          <div className="form-section">
            <h3>Información del Servicio</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="booking-service">Servicio</label>
                <input 
                  id="booking-service"
                  type="text" 
                  value={initialData?.serviceName || 'Seleccionar servicio'} 
                  readOnly 
                  className="readonly-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="booking-barber">Barbero</label>
                <select 
                  id="booking-barber"
                  value={formData.barber} 
                  onChange={e => updateField('barber', e.target.value)}
                  required
                  disabled={loadingBarbers}
                >
                  <option value="">
                    {loadingBarbers ? 'Cargando barberos...' : 'Selecciona un barbero'}
                  </option>
                  {barbers.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Fecha y Hora</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="booking-date">Fecha</label>
                <input 
                  id="booking-date"
                  type="date" 
                  required 
                  value={formData.date}
                  onChange={e => updateField('date', e.target.value)}
                  min={today}
                />
              </div>
              <div className="form-group">
                <label htmlFor="booking-time">Hora</label>
                <select 
                  id="booking-time"
                  required
                  value={formData.time}
                  onChange={e => updateField('time', e.target.value)}
                >
                  <option value="">Selecciona hora</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Tus Datos</h3>
            <div className="form-group">
              <label htmlFor="booking-name">Nombre Completo</label>
              <input 
                id="booking-name"
                type="text" 
                placeholder="Ej. Juan Pérez" 
                required
                maxLength={100}
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="booking-email">Email</label>
                <input 
                  id="booking-email"
                  type="email" 
                  placeholder="juan@ejemplo.com" 
                  required
                  maxLength={254}
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="booking-phone">Teléfono</label>
                <input 
                  id="booking-phone"
                  type="tel" 
                  placeholder="+34 600 000 000" 
                  required
                  maxLength={20}
                  value={formData.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-booking-btn"
            disabled={submitting}
          >
            {submitting ? 'Reservando...' : 'Confirmar Reserva'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
