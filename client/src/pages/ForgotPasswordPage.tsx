import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Por favor ingresa tu email.'); return; }

    setIsLoading(true);
    // Simulate API call — wire up to POST /api/auth/forgot-password when backend is ready
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            Recuperar <span>Contraseña</span>
          </h1>
          <p>Ingresa tu email y te enviaremos las instrucciones</p>
        </div>

        {sent ? (
          <div className="fp-success">
            <div className="fp-success-icon">📧</div>
            <h3>¡Revisa tu bandeja de entrada!</h3>
            <p>
              Enviamos un enlace de recuperación a <strong>{email}</strong>.
              Si no ves el email, revisa tu carpeta de spam.
            </p>
            <Link to="/login" className="auth-submit fp-back-link">Volver al inicio de sesión</Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠</span>
                <p>{error}</p>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="fp-email">Email</label>
                <div className="input-wrapper">
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Enviando...
                  </span>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                ¿Recordaste tu contraseña?{' '}
                <Link to="/login">Iniciar sesión</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
