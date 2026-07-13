import type { Service, Barber, Appointment, BookingFormData, LoginData, RegisterData, AuthResponse, User } from '../types/index';
import { ApiError } from '../types/index';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Helper: request normalizado ────────────────────────────────────────────

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(
      body.error || `Request failed: ${response.statusText}`,
      response.status
    );
  }

  return body.data as T;
}

// ─── MOCK DATA (fallback cuando el backend no está disponible) ──────────────

const MOCK_SERVICES: Service[] = [
  {
    _id: '1',
    name: 'Corte Clásico',
    description: 'Corte tradicional con tijera y máquina, incluye lavado y peinado con productos premium de fijación.',
    price: 25,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop'
  },
  {
    _id: '2',
    name: 'Arreglo de Barba Royale',
    description: 'Perfilado detallado con toalla caliente, aceites esenciales y afeitado tradicional con navaja para un acabado perfecto.',
    price: 15,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop'
  },
  {
    _id: '3',
    name: 'Corte + Barba (Combo)',
    description: 'El servicio completo para el caballero moderno. Incluye hidratación facial y máxima atención al detalle.',
    price: 35,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1593702295094-ada75dc4d19d?q=80&w=2070&auto=format&fit=crop'
  },
  {
    _id: '4',
    name: 'Afeitado de Cabeza',
    description: 'Afeitado a navaja para un acabado suave y duradero. Incluye masaje hidratante post-afeitado.',
    price: 20,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1512690118294-700346097746?q=80&w=2070&auto=format&fit=crop'
  },
  {
    _id: '5',
    name: 'Tinte de Barba',
    description: 'Cubrimiento de canas o cambio de tono para una barba con aspecto más tupido y rejuvenecido.',
    price: 18,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop'
  },
  {
    _id: '6',
    name: 'Masaje Capilar',
    description: 'Tratamiento relajante con aceites nutritivos que estimulan el crecimiento y la salud del cuero cabelludo.',
    price: 12,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070&auto=format&fit=crop'
  }
];

const MOCK_BARBERS: Barber[] = [
  {
    _id: '1',
    name: 'Marco "The Blade"',
    bio: 'Maestro del degradado perfecto. Más de 10 años esculpiendo los estilos más precisos de la ciudad.',
    image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=2070&auto=format&fit=crop',
    specialties: ['Corte Clásico', 'Degradados'],
    isActive: true
  },
  {
    _id: '2',
    name: 'Sofia Barber',
    bio: 'Especialista en cuidado facial y diseño de barba. Transforma cualquier barba rebelde en una obra de arte.',
    image: 'https://images.unsplash.com/photo-1613483445507-68641178229b?q=80&w=2070&auto=format&fit=crop',
    specialties: ['Arreglo de Barba', 'Tratamientos Faciales'],
    isActive: true
  },
  {
    _id: '3',
    name: 'Arthur Shelby',
    bio: 'Estilo clásico británico. Especialista en cortes a tijera y afeitados tradicionales con toalla caliente.',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2072&auto=format&fit=crop',
    specialties: ['Cortes a Tijera', 'Afeitado Tradicional'],
    isActive: true
  }
];

// ─── Servicios ──────────────────────────────────────────────────────────────

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const services = await request<Service[]>('/services');
    return services.length > 0 ? services : MOCK_SERVICES;
  } catch (error) {
    console.warn('[API] fetchServices fallback to mock:', (error as Error).message);
    return MOCK_SERVICES;
  }
};

// ─── Barberos ───────────────────────────────────────────────────────────────

export const fetchBarbers = async (): Promise<Barber[]> => {
  try {
    const barbers = await request<Barber[]>('/barbers');
    return barbers.length > 0 ? barbers : MOCK_BARBERS;
  } catch (error) {
    console.warn('[API] fetchBarbers fallback to mock:', (error as Error).message);
    return MOCK_BARBERS;
  }
};

// ─── Citas ──────────────────────────────────────────────────────────────────

export const createAppointment = async (data: BookingFormData): Promise<Appointment> => {
  return request<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ─── Auth ───────────────────────────────────────────────────────────────────

async function authRequest<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(
      body.error || `Request failed: ${response.statusText}`,
      response.status
    );
  }

  return body as T;
}

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(body.error || 'Login failed', response.status);
  }

  return body as AuthResponse;
};

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(body.error || 'Registration failed', response.status);
  }

  return body as AuthResponse;
};

export const fetchCurrentUser = async (token: string): Promise<User> => {
  const result = await authRequest<{ success: boolean; data: User }>('/auth/me', token);
  return result.data;
};
