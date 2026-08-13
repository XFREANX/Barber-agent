import React, { useState, useEffect, useCallback } from 'react';
import type { BookingInitialData, BookingFormData, Barber } from '../types/index';
import { fetchBarbers, createAppointment } from '../services/api';
import { formatDate, getTodayISO, formatPrice } from '../utils/formatters';
import CalendarPicker from './CalendarPicker';
import TimeSlotPicker from './TimeSlotPicker';
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

type Step = 1 | 2 | 3; // 1=Info, 2=Datetime, 3=Payment

// ─── Componente ─────────────────────────────────────────────────────────────

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BookingInitialData;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialData }) => {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<BookingFormData>(EMPTY_FORM);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Mock card fields — not sent to backend (UI only)
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...EMPTY_FORM, service: initialData?.serviceId ?? '', barber: initialData?.barberId ?? '' });
      setSubmitError(null);
      setSuccess(false);
      setStep(1);
      setCardNum('');
      setCardExpiry('');
      setCardCVC('');
      setCardError(null);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const load = async () => {
      setLoadingBarbers(true);
      try {
        const data = await fetchBarbers();
        if (!cancelled) setBarbers(data);
      } catch { /* fallback in fetchBarbers */ }
      finally { if (!cancelled) setLoadingBarbers(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setFormData(EMPTY_FORM);
    setSubmitError(null);
    setSuccess(false);
    setSubmitting(false);
    setStep(1);
    onClose();
  }, [onClose]);

  const updateField = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitize(value) }));
    if (submitError) setSubmitError(null);
  };

  // ── Step 1 validation (personal info + barber)
  const validateStep1 = (): string | null => {
    if (!formData.name || formData.name.length < 2) return 'Ingresa tu nombre completo (mín. 2 caracteres).';
    if (formData.name.length > 100) return 'El nombre no puede exceder 100 caracteres.';
    if (!formData.email || !EMAIL_REGEX.test(formData.email)) return 'Por favor ingresa un email válido.';
    if (!formData.phone || !PHONE_REGEX.test(formData.phone)) return 'Por favor ingresa un teléfono válido.';
    if (!formData.barber) return 'Por favor selecciona un barbero.';
    return null;
  };

  // ── Step 2 validation (date + time)
  const validateStep2 = (): string | null => {
    if (!formData.date) return 'Por favor selecciona una fecha.';
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return 'La fecha no puede ser en el pasado.';
    if (!formData.time) return 'Por favor selecciona una hora.';
    return null;
  };

  const handleStep1Next = () => {
    const err = validateStep1();
    if (err) { setSubmitError(err); return; }
    setSubmitError(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    const err = validateStep2();
    if (err) { setSubmitError(err); return; }
    setSubmitError(null);
    setStep(3);
  };

  // ── Final submit (booking + mock payment)
  const handlePayAndBook = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate card fields (UI-only mock validation)
    const cleanCard = cardNum.replace(/\s/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) { setCardError('Número de tarjeta inválido.'); return; }
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) { setCardError('Vencimiento inválido (MM/AA).'); return; }
    if (!cardCVC.match(/^\d{3,4}$/)) { setCardError('CVC inválido.'); return; }

    setCardError(null);
    setPaymentProcessing(true);

    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1200));
    setPaymentProcessing(false);

    // Actual booking
    setSubmitting(true);
    try {
      await createAppointment(formData);
      setSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al reservar.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCardNum = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  // ── Don't render if closed
  if (!isOpen) return null;

  const today = getTodayISO();
  const selectedBarber = barbers.find(b => b._id === formData.barber);
  const serviceName = initialData?.serviceName ?? 'Servicio seleccionado';

  // ── Success screen
  if (success) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content success-view" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className="success-icon">✓</div>
          <h2 id="success-title">¡Reserva Confirmada!</h2>
          <p className="success-message">
            Tu cita ha sido registrada. Te enviaremos una confirmación a <strong>{formData.email}</strong>.
          </p>
          <div className="success-details">
            <p><strong>Fecha:</strong> {formatDate(formData.date)}</p>
            <p><strong>Hora:</strong> {formData.time}</p>
            {serviceName && <p><strong>Servicio:</strong> {serviceName}</p>}
            {selectedBarber && <p><strong>Barbero:</strong> {selectedBarber.name}</p>}
          </div>
          <button className="submit-booking-btn" onClick={handleClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  // Step progress indicator
  const stepLabels = ['Información', 'Fecha & Hora', 'Pago'];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
        <button className="close-btn" onClick={handleClose} aria-label="Cerrar modal">&times;</button>

        <div className="modal-header">
          <h2 id="modal-title">Reserva tu Cita</h2>
          <p id="modal-desc">Selecciona el momento perfecto para tu cambio de look</p>
        </div>

        {/* Step indicators */}
        <div className="step-indicator">
          {stepLabels.map((label, i) => {
            const n = (i + 1) as Step;
            return (
              <React.Fragment key={n}>
                <div className={`step-dot${step === n ? ' active' : ''}${step > n ? ' done' : ''}`}>
                  {step > n ? '✓' : n}
                  <span className="step-label">{label}</span>
                </div>
                {i < 2 && <div className={`step-line${step > n ? ' done' : ''}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {submitError && <div className="form-error" role="alert">{submitError}</div>}

        {/* ── STEP 1: Personal info + barber ── */}
        {step === 1 && (
          <div className="booking-step">
            <div className="form-section">
              <h3>Tus Datos</h3>
              <div className="form-group">
                <label htmlFor="booking-name">Nombre Completo</label>
                <input id="booking-name" type="text" placeholder="Ej. Juan Pérez" required maxLength={100} value={formData.name} onChange={e => updateField('name', e.target.value)} autoComplete="name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="booking-email">Email</label>
                  <input id="booking-email" type="email" placeholder="juan@ejemplo.com" required maxLength={254} value={formData.email} onChange={e => updateField('email', e.target.value)} autoComplete="email" />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-phone">Teléfono</label>
                  <input id="booking-phone" type="tel" placeholder="+34 600 000 000" required maxLength={20} value={formData.phone} onChange={e => updateField('phone', e.target.value)} autoComplete="tel" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Información del Servicio</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="booking-service">Servicio</label>
                  <input id="booking-service" type="text" value={serviceName} readOnly className="readonly-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-barber">Barbero</label>
                  <select id="booking-barber" value={formData.barber} onChange={e => updateField('barber', e.target.value)} required disabled={loadingBarbers}>
                    <option value="">{loadingBarbers ? 'Cargando...' : 'Selecciona un barbero'}</option>
                    {barbers.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="button" className="submit-booking-btn" onClick={handleStep1Next}>
              Siguiente → Fecha y Hora
            </button>
          </div>
        )}

        {/* ── STEP 2: Calendar + Time ── */}
        {step === 2 && (
          <div className="booking-step">
            <div className="form-section">
              <h3>Selecciona tu Fecha</h3>
              <CalendarPicker
                selectedDate={formData.date}
                onDateSelect={date => updateField('date', date)}
                minDate={today}
              />
            </div>

            {formData.date && (
              <div className="form-section">
                <h3>Horarios Disponibles — {formatDate(formData.date)}</h3>
                <TimeSlotPicker
                  selectedTime={formData.time}
                  onTimeSelect={time => updateField('time', time)}
                />
              </div>
            )}

            <div className="step-nav">
              <button type="button" className="back-btn" onClick={() => setStep(1)}>← Atrás</button>
              <button type="button" className="submit-booking-btn" onClick={handleStep2Next}>
                Siguiente → Pago
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === 3 && (
          <form className="booking-step" onSubmit={handlePayAndBook} noValidate>
            <div className="form-section">
              <h3>Resumen de tu Reserva</h3>
              <div className="booking-summary">
                <div className="summary-row"><span>Servicio</span><strong>{serviceName}</strong></div>
                {selectedBarber && <div className="summary-row"><span>Barbero</span><strong>{selectedBarber.name}</strong></div>}
                <div className="summary-row"><span>Fecha</span><strong>{formatDate(formData.date)}</strong></div>
                <div className="summary-row"><span>Hora</span><strong>{formData.time}</strong></div>
                <div className="summary-row total"><span>Total</span><strong className="total-price">{formatPrice(initialData?.price ?? 25)}</strong></div>
              </div>
            </div>

            <div className="form-section">
              <h3>💳 Datos de Pago</h3>
              <p className="payment-note">Entorno de demostración — no se realizará ningún cargo real.</p>
              <div className="form-group">
                <label htmlFor="card-num">Número de Tarjeta</label>
                <input
                  id="card-num"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNum}
                  onChange={e => setCardNum(formatCardNum(e.target.value))}
                  maxLength={19}
                  autoComplete="cc-number"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="card-expiry">Vencimiento</label>
                  <input
                    id="card-expiry"
                    type="text"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    autoComplete="cc-exp"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="card-cvc">CVC</label>
                  <input
                    id="card-cvc"
                    type="text"
                    placeholder="123"
                    value={cardCVC}
                    onChange={e => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
              {cardError && <div className="form-error" role="alert">{cardError}</div>}
            </div>

            <div className="step-nav">
              <button type="button" className="back-btn" onClick={() => setStep(2)}>← Atrás</button>
              <button type="submit" className="submit-booking-btn pay-btn" disabled={submitting || paymentProcessing}>
                {paymentProcessing ? '⏳ Procesando pago...' : submitting ? 'Reservando...' : `🔒 Pagar y Confirmar`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
