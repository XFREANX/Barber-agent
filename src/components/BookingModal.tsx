import React, { useState } from 'react';
import './BookingModal.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    serviceId?: string;
    serviceName?: string;
    barberId?: string;
    barberName?: string;
  };
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: initialData?.serviceId || '',
    barber: initialData?.barberId || ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reserva enviada:', formData);
    // Aquí iría la llamada al API POST /api/appointments
    alert('¡Cita reservada con éxito! (Simulado)');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>Reserva tu Cita</h2>
          <p>Selecciona el momento perfecto para tu cambio de look</p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h3>Información del Servicio</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Servicio</label>
                <input 
                  type="text" 
                  value={initialData?.serviceName || 'Seleccionar servicio'} 
                  readOnly 
                  className="readonly-input"
                />
              </div>
              <div className="form-group">
                <label>Barbero</label>
                <select 
                  value={formData.barber} 
                  onChange={e => setFormData({...formData, barber: e.target.value})}
                  required
                >
                  <option value="">Selecciona un barbero</option>
                  <option value="1">Marco "The Blade"</option>
                  <option value="2">Sofia Barber</option>
                  <option value="3">Arthur Shelby</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Fecha y Hora</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha</label>
                <input 
                  type="date" 
                  required 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <select 
                  required
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
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
              <label>Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="juan@ejemplo.com" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  type="tel" 
                  placeholder="+34 600 000 000" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-booking-btn">
            Confirmar Reserva
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
