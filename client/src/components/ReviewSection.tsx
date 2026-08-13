import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ReviewSection.css';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewSectionProps {
  barberId: string;
  barberName: string;
}

const MOCK_REVIEWS: Record<string, Review[]> = {};

function getMockReviews(barberId: string): Review[] {
  return MOCK_REVIEWS[barberId] ?? [
    { id: 'r1', userName: 'Carlos M.', rating: 5, comment: 'Excelente corte, muy profesional. Volveré sin duda.', date: '2026-08-01' },
    { id: 'r2', userName: 'Jorge P.', rating: 4, comment: 'Buen trabajo, puntual y limpio. Lo recomiendo.', date: '2026-07-22' },
  ];
}

const StarInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-input" role="group" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star-btn${(hover || value) >= star ? ' lit' : ''}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
          aria-pressed={value === star}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="star-display" aria-label={`${rating} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} className={`star${s <= rating ? ' lit' : ''}`}>★</span>
    ))}
  </span>
);

export const ReviewSection: React.FC<ReviewSectionProps> = ({ barberId, barberName }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setReviews(getMockReviews(barberId));
  }, [barberId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setSubmitError('Por favor selecciona una calificación.'); return; }
    if (comment.trim().length < 5) { setSubmitError('El comentario debe tener al menos 5 caracteres.'); return; }
    setSubmitting(true);
    setSubmitError(null);

    await new Promise(r => setTimeout(r, 700));

    const newReview: Review = {
      id: `local-${Date.now()}`,
      userName: user?.name ?? 'Tú',
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    setReviews(prev => [newReview, ...prev]);
    setRating(0);
    setComment('');
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="review-section">
      <div className="review-summary">
        <div className="avg-rating">
          <span className="avg-number">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
          <StarDisplay rating={Math.round(avgRating)} />
          <span className="review-count">
            {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="review-list">
        {reviews.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-avatar">{r.userName[0].toUpperCase()}</div>
              <div className="reviewer-info">
                <span className="reviewer-name">{r.userName}</span>
                <span className="review-date">{r.date}</span>
              </div>
              <StarDisplay rating={r.rating} />
            </div>
            <p className="review-comment">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="no-reviews">Sé el primero en dejar una reseña para {barberName}.</p>
        )}
      </div>

      {isAuthenticated ? (
        <form className="review-form" onSubmit={handleSubmit} noValidate>
          <h4 className="review-form-title">Deja tu reseña</h4>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            className="review-textarea"
            placeholder="Cuéntanos tu experiencia..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
            rows={3}
          />
          {submitError && <p className="review-error">{submitError}</p>}
          {submitted && <p className="review-success">¡Reseña publicada! Gracias.</p>}
          <button
            type="submit"
            className="review-submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Publicando...' : 'Publicar reseña'}
          </button>
        </form>
      ) : (
        <p className="review-login-prompt">
          <a href="/login">Inicia sesión</a> para dejar una reseña.
        </p>
      )}
    </div>
  );
};

export default ReviewSection;
