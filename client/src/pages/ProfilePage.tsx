import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-skeleton">
          <div className="skeleton-avatar" />
          <div className="skeleton-line" style={{ width: '60%' }} />
          <div className="skeleton-line" style={{ width: '40%' }} />
        </div>
      </div>
    );
  }

  const isFormUnchanged = name.trim() === (user.name || '') && phone.trim() === (user.phone || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }

    if (isFormUnchanged) return;

    setIsSubmitting(true);
    try {
      await updateUser({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      setSuccessMessage('¡Perfil actualizado correctamente!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el perfil. Intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="profile-title">{user.name}</h1>
          <div className="profile-badges">
            <span className="profile-badge email-badge">✉ {user.email}</span>
            <span className={`profile-badge role-badge role-${user.role}`}>
              {user.role === 'admin' ? '⚡ Administrador' : '👤 Cliente'}
            </span>
          </div>
        </div>

        <div className="profile-divider" />

        <h2 className="profile-section-title">Información Personal</h2>

        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠</span>
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="profile-success">
            <span className="success-icon">✓</span>
            <p>{successMessage}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="profile-name">Nombre Completo</label>
            <div className="input-wrapper">
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">
              Email <span className="read-only-tag">(No editable)</span>
            </label>
            <div className="input-wrapper">
              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="input-disabled"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-phone">Teléfono</label>
            <div className="input-wrapper">
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting || isFormUnchanged}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner" />
                Guardando...
              </span>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
