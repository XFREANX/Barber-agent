import { useEffect, useState } from 'react';
import { fetchBarbers } from '../services/api';
import type { Barber } from '../types/index';

/**
 * Hook para cargar la lista de barberos desde la API.
 * Encapsula estado de loading, error y datos.
 */
export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchBarbers();
        if (!cancelled) setBarbers(data);
      } catch {
        if (!cancelled) setError('Error al cargar los barberos. Intenta de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { barbers, loading, error };
}
