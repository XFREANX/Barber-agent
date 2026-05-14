import { useEffect, useState } from 'react';
import { fetchServices } from '../services/api';
import type { Service } from '../types/index';

/**
 * Hook para cargar la lista de servicios desde la API.
 * Encapsula estado de loading, error y datos.
 */
export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchServices();
        if (!cancelled) setServices(data);
      } catch {
        if (!cancelled) setError('Error al cargar los servicios. Intenta de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { services, loading, error };
}
