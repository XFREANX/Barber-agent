import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';
import './ResetPasswordPage.css';

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
  const colors = ['#e53935', '#f44336', '#ff9800', '#4caf50', '#00c853'];
  return { score, label: labels[score] ?? 'Muy débil', color: colors[score] ?? '#e53935' };
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) { setError('La contraseña debe tener mínimo 6 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }

    setIsLoading(true);
    // Simulate API call — wire up to PUT /api/auth/reset-password/:token when backend is ready
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    setDone(true);
    setTimeout(() => navigate('/login'), 2500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            Nueva <span>Contraseña</span>
          </h1>
          <p>Elige una contraseña segura para tu cuenta</p>
        </div>

        {done ? (
          <div className="rp-success">
            <div className="rp-icon">✅</div>
            <h3>¡Contraseña actualizada!</h3>
            <p>Redirigiendo al inicio de sesión...</p>
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
                <label htmlFor="rp-password">Nueva Contraseña</label>
                <div className="input-wrapper">
                  <input
                    id="rp-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label={showPw ? 'Ocultar' : 'Mostrar'}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="strength-meter">
                    <div className="strength-bar">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`strength-segment${i < strength.score ? ' filled' : ''}`}
                          style={{ background: i < strength.score ? strength.color : undefined }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="rp-confirm">Confirmar Contraseña</label>
                <div className="input-wrapper">
                  <input
                    id="rp-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                {confirm.length > 0 && password !== confirm && (
                  <p className="field-error">Las contraseñas no coinciden</p>
                )}
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="btn-loading"><span className="spinner" />Guardando...</span>
                ) : (
                  'Guardar nueva contraseña'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p><Link to="/login">Volver al inicio de sesión</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
