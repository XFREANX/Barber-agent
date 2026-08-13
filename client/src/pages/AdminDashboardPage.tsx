import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAllAppointments,
  updateAppointmentStatus,
  fetchServices,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  fetchBarbers,
  createBarberAdmin,
  updateBarberAdmin,
  deleteBarberAdmin,
  fetchUsersAdmin,
  updateUserAdmin,
  deleteUserAdmin,
} from '../services/api';
import type { Appointment, Service, Barber, User } from '../types/index';
import { formatPrice, formatDate } from '../utils/formatters';
import './AdminDashboardPage.css';

type AdminTab = 'appointments' | 'services' | 'barbers' | 'users';

export const AdminDashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');
  const [loading, setLoading] = useState(true);

  // Data states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [serviceModal, setServiceModal] = useState<{ open: boolean; item?: Service }>({ open: false });
  const [barberModal, setBarberModal] = useState<{ open: boolean; item?: Barber }>({ open: false });

  // Service form state
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: 20, duration: 30, image: '' });

  // Barber form state
  const [barberForm, setBarberForm] = useState({ name: '', bio: '', image: '', specialties: '', isActive: true });

  const loadAllData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appsData, srvsData, barbsData, usersData] = await Promise.all([
        fetchAllAppointments(token),
        fetchServices(),
        fetchBarbers(),
        fetchUsersAdmin(token),
      ]);
      setAppointments(appsData);
      setServices(srvsData);
      setBarbers(barbsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Metrics
  const stats = useMemo(() => {
    const todayISO = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(a => a.date && a.date.startsWith(todayISO));
    const revenue = appointments
      .filter(a => a.status === 'confirmed' || a.status === 'completed')
      .reduce((sum, a) => sum + (a.totalPrice || 0), 0);
    const activeBarbersCount = barbers.filter(b => b.isActive).length;

    return {
      totalAppointments: appointments.length,
      todayAppointments: todayApps.length,
      revenue,
      activeBarbers: activeBarbersCount,
    };
  }, [appointments, barbers]);

  // Handle appointment status change
  const handleStatusChange = async (id: string, newStatus: Appointment['status']) => {
    if (!token) return;
    try {
      await updateAppointmentStatus(token, id, newStatus);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert((err as Error).message || 'Error al actualizar el estado');
    }
  };

  // Service Modal handlers
  const openServiceModal = (service?: Service) => {
    if (service) {
      setServiceForm({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        image: service.image || '',
      });
      setServiceModal({ open: true, item: service });
    } else {
      setServiceForm({ name: '', description: '', price: 20, duration: 30, image: '' });
      setServiceModal({ open: true });
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (serviceModal.item) {
        const updated = await updateServiceAdmin(token, serviceModal.item._id, serviceForm);
        setServices(prev => prev.map(s => s._id === updated._id ? updated : s));
      } else {
        const created = await createServiceAdmin(token, serviceForm);
        setServices(prev => [created, ...prev]);
      }
      setServiceModal({ open: false });
    } catch (err) {
      alert((err as Error).message || 'Error al guardar servicio');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!token) return;
    if (!window.confirm('¿Seguro que deseas eliminar este servicio?')) return;
    try {
      await deleteServiceAdmin(token, id);
      setServices(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert((err as Error).message || 'Error al eliminar servicio');
    }
  };

  // Barber Modal handlers
  const openBarberModal = (barber?: Barber) => {
    if (barber) {
      setBarberForm({
        name: barber.name,
        bio: barber.bio,
        image: barber.image,
        specialties: Array.isArray(barber.specialties) ? barber.specialties.join(', ') : '',
        isActive: barber.isActive,
      });
      setBarberModal({ open: true, item: barber });
    } else {
      setBarberForm({ name: '', bio: '', image: '', specialties: '', isActive: true });
      setBarberModal({ open: true });
    }
  };

  const handleSaveBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const specialtiesArr = barberForm.specialties.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      name: barberForm.name,
      bio: barberForm.bio,
      image: barberForm.image,
      specialties: specialtiesArr,
      isActive: barberForm.isActive,
    };
    try {
      if (barberModal.item) {
        const updated = await updateBarberAdmin(token, barberModal.item._id, payload);
        setBarbers(prev => prev.map(b => b._id === updated._id ? updated : b));
      } else {
        const created = await createBarberAdmin(token, payload);
        setBarbers(prev => [created, ...prev]);
      }
      setBarberModal({ open: false });
    } catch (err) {
      alert((err as Error).message || 'Error al guardar barbero');
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!token) return;
    if (!window.confirm('¿Seguro que deseas eliminar este barbero?')) return;
    try {
      await deleteBarberAdmin(token, id);
      setBarbers(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      alert((err as Error).message || 'Error al eliminar barbero');
    }
  };

  // User Role Switch
  const handleToggleRole = async (user: User) => {
    if (!token) return;
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`¿Cambiar el rol de ${user.name} a ${newRole.toUpperCase()}?`)) return;
    try {
      const updated = await updateUserAdmin(token, user._id, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? updated : u));
    } catch (err) {
      alert((err as Error).message || 'Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!token) return;
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      await deleteUserAdmin(token, id);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert((err as Error).message || 'Error al eliminar usuario');
    }
  };

  // Helpers for text resolution
  const resolveName = (item: Service | Barber | string | undefined, defaultText: string) => {
    if (typeof item === 'object' && item !== null) return item.name;
    return defaultText;
  };

  // Filtered lists
  const filteredAppointments = appointments.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const clientMatch = a.clientName.toLowerCase().includes(searchLower);
    const emailMatch = a.clientEmail.toLowerCase().includes(searchLower);
    return clientMatch || emailMatch;
  });

  return (
    <div className="admin-dashboard-page">
      <header className="admin-header">
        <div>
          <h1 className="title">⚡ Panel de Administración</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestión global de citas, catálogo, personal y usuarios</p>
        </div>
        <span className="badge">Control Center</span>
      </header>

      {/* Metrics */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-val">{stats.totalAppointments}</div>
            <div className="stat-lbl">Total Citas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div>
            <div className="stat-val">{stats.todayAppointments}</div>
            <div className="stat-lbl">Citas para Hoy</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <div className="stat-val">{formatPrice(stats.revenue)}</div>
            <div className="stat-lbl">Ingresos Confirmados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💈</div>
          <div>
            <div className="stat-val">{stats.activeBarbers} / {barbers.length}</div>
            <div className="stat-lbl">Barberos Activos</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Gestión de Citas ({appointments.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          ✂️ Catálogo de Servicios ({services.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'barbers' ? 'active' : ''}`}
          onClick={() => setActiveTab('barbers')}
        >
          💈 Equipo de Barberos ({barbers.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👤 Usuarios Registrados ({users.length})
        </button>
      </div>

      {loading ? (
        <div className="status-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loader"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando información administrativa...</p>
        </div>
      ) : (
        <>
          {/* 📅 APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <div>
              <div className="admin-action-bar">
                <input
                  type="text"
                  placeholder="🔍 Buscar por cliente o email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Servicio</th>
                      <th>Barbero</th>
                      <th>Fecha / Hora</th>
                      <th>Precio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map(app => (
                        <tr key={app._id}>
                          <td><strong>{app.clientName}</strong></td>
                          <td>
                            <div>{app.clientEmail}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.clientPhone}</div>
                          </td>
                          <td>{resolveName(app.service, 'Servicio')}</td>
                          <td>{resolveName(app.barber, 'Barbero')}</td>
                          <td>{formatDate(app.date)} a las <strong>{app.time}</strong></td>
                          <td>{app.totalPrice ? formatPrice(app.totalPrice) : '-'}</td>
                          <td>
                            <select
                              value={app.status}
                              onChange={e => handleStatusChange(app._id, e.target.value as Appointment['status'])}
                              className="status-select"
                            >
                              <option value="pending">🟡 Pendiente</option>
                              <option value="confirmed">🟢 Confirmada</option>
                              <option value="completed">🔵 Completada</option>
                              <option value="cancelled">🔴 Cancelada</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No se encontraron citas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ✂️ SERVICES TAB */}
          {activeTab === 'services' && (
            <div>
              <div className="admin-action-bar">
                <h3 style={{ color: '#fff' }}>Servicios Activos</h3>
                <button className="btn-add-new" onClick={() => openServiceModal()}>
                  + Nuevo Servicio
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Precio</th>
                      <th>Duración</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(srv => (
                      <tr key={srv._id}>
                        <td><strong>{srv.name}</strong></td>
                        <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{srv.description}</td>
                        <td><strong style={{ color: 'var(--primary-color)' }}>{formatPrice(srv.price)}</strong></td>
                        <td>{srv.duration} min</td>
                        <td>
                          <div className="action-btn-group">
                            <button className="btn-icon" onClick={() => openServiceModal(srv)}>✏️ Editar</button>
                            <button className="btn-icon delete" onClick={() => handleDeleteService(srv._id)}>🗑️ Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 💈 BARBERS TAB */}
          {activeTab === 'barbers' && (
            <div>
              <div className="admin-action-bar">
                <h3 style={{ color: '#fff' }}>Equipo de Barberos</h3>
                <button className="btn-add-new" onClick={() => openBarberModal()}>
                  + Nuevo Barbero
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Barbero</th>
                      <th>Bio</th>
                      <th>Especialidades</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barbers.map(barb => (
                      <tr key={barb._id}>
                        <td><strong>{barb.name}</strong></td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{barb.bio}</td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {Array.isArray(barb.specialties) ? barb.specialties.join(', ') : 'General'}
                        </td>
                        <td>
                          <span style={{ color: barb.isActive ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                            {barb.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btn-group">
                            <button className="btn-icon" onClick={() => openBarberModal(barb)}>✏️ Editar</button>
                            <button className="btn-icon delete" onClick={() => handleDeleteBarber(barb._id)}>🗑️ Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 👤 USERS TAB */}
          {activeTab === 'users' && (
            <div>
              <div className="admin-action-bar">
                <h3 style={{ color: '#fff' }}>Usuarios Registrados</h3>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Rol Actual</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone || '-'}</td>
                        <td>
                          <span className={`status-badge ${u.role === 'admin' ? 'confirmed' : 'pending'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="action-btn-group">
                            <button className="btn-icon" onClick={() => handleToggleRole(u)}>
                              {u.role === 'admin' ? 'Hacer Cliente' : 'Hacer Admin'}
                            </button>
                            <button className="btn-icon delete" onClick={() => handleDeleteUser(u._id)}>
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* SERVICE MODAL */}
      {serviceModal.open && (
        <div className="modal-overlay" onClick={() => setServiceModal({ open: false })}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <h2>{serviceModal.item ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
            <form onSubmit={handleSaveService}>
              <div className="admin-form-group">
                <label>Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label>Descripción</label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label>Precio ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={serviceForm.price}
                    onChange={e => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Duración (minutos)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={serviceForm.duration}
                    onChange={e => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>URL de Imagen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={serviceForm.image}
                  onChange={e => setServiceForm({ ...serviceForm, image: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setServiceModal({ open: false })}>
                  Cancelar
                </button>
                <button type="submit" className="btn-add-new">
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARBER MODAL */}
      {barberModal.open && (
        <div className="modal-overlay" onClick={() => setBarberModal({ open: false })}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <h2>{barberModal.item ? 'Editar Barbero' : 'Nuevo Barbero'}</h2>
            <form onSubmit={handleSaveBarber}>
              <div className="admin-form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={barberForm.name}
                  onChange={e => setBarberForm({ ...barberForm, name: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label>Biografía / Experiencia</label>
                <textarea
                  rows={3}
                  required
                  value={barberForm.bio}
                  onChange={e => setBarberForm({ ...barberForm, bio: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label>Especialidades (separadas por coma)</label>
                <input
                  type="text"
                  placeholder="Corte Clásico, Degradados, Barba"
                  value={barberForm.specialties}
                  onChange={e => setBarberForm({ ...barberForm, specialties: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label>URL de Foto de Perfil</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={barberForm.image}
                  onChange={e => setBarberForm({ ...barberForm, image: e.target.value })}
                />
              </div>
              <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  style={{ width: 'auto' }}
                  checked={barberForm.isActive}
                  onChange={e => setBarberForm({ ...barberForm, isActive: e.target.checked })}
                />
                <label htmlFor="isActiveCheck" style={{ marginBottom: 0 }}>Barbero Activo en Agenda</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setBarberModal({ open: false })}>
                  Cancelar
                </button>
                <button type="submit" className="btn-add-new">
                  Guardar Barbero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
