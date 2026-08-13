import type { Service, Barber, Appointment, BookingFormData, LoginData, RegisterData, UpdateProfileData, AuthResponse, User } from '../types/index';

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
    if (response.status === 401) {
      localStorage.removeItem('barber_app_token');
    }
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

export const updateProfile = async (token: string, data: UpdateProfileData): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('barber_app_token');
    }
    throw new ApiError(body.error || 'Profile update failed', response.status);
  }

  return body.data as User;
};

// ─── MOCK APPOINTMENTS STORAGE ───────────────────────────────────────────────

let MOCK_APPOINTMENTS: Appointment[] = [
  {
    _id: 'app_1',
    clientName: 'Carlos Mendoza',
    clientEmail: 'carlos@example.com',
    clientPhone: '+58 412 1234567',
    barber: MOCK_BARBERS[0],
    service: MOCK_SERVICES[2], // Corte + Barba
    date: '2026-08-15',
    time: '14:00',
    status: 'confirmed',
    totalPrice: 35,
    notes: 'Preferiblemente navaja suave',
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    _id: 'app_2',
    clientName: 'Carlos Mendoza',
    clientEmail: 'carlos@example.com',
    clientPhone: '+58 412 1234567',
    barber: MOCK_BARBERS[1],
    service: MOCK_SERVICES[1], // Arreglo Barba Royale
    date: '2026-08-01',
    time: '11:30',
    status: 'completed',
    totalPrice: 15,
    createdAt: '2026-07-28T15:30:00Z',
  },
  {
    _id: 'app_3',
    clientName: 'Alejandro Rivas',
    clientEmail: 'admin@barbershop.com',
    clientPhone: '+58 424 9876543',
    barber: MOCK_BARBERS[2],
    service: MOCK_SERVICES[0], // Corte Clásico
    date: '2026-08-13',
    time: '16:00',
    status: 'pending',
    totalPrice: 25,
    createdAt: '2026-08-12T09:00:00Z',
  },
];

let MOCK_USERS: User[] = [
  { _id: 'u_1', publicId: 'uuid-1', name: 'Administrador Principal', email: 'admin@barbershop.com', phone: '+58 412 0000000', role: 'admin' },
  { _id: 'u_2', publicId: 'uuid-2', name: 'Carlos Mendoza', email: 'carlos@example.com', phone: '+58 412 1234567', role: 'customer' },
  { _id: 'u_3', publicId: 'uuid-3', name: 'Juan Pérez', email: 'juan@example.com', phone: '+58 414 7654321', role: 'customer' },
];

// ─── USER APPOINTMENTS ───────────────────────────────────────────────────────

export const fetchMyAppointments = async (token: string): Promise<Appointment[]> => {
  try {
    const result = await authRequest<{ success: boolean; data: Appointment[] }>('/appointments/my', token);
    return result.data;
  } catch (error) {
    console.warn('[API] fetchMyAppointments fallback to mock:', (error as Error).message);
    return MOCK_APPOINTMENTS;
  }
};

export const cancelMyAppointment = async (token: string, id: string): Promise<Appointment> => {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const body = await response.json();
    if (!response.ok) throw new ApiError(body.error || 'Cancel appointment failed', response.status);
    return body.data as Appointment;
  } catch (error) {
    console.warn('[API] cancelMyAppointment fallback to mock:', (error as Error).message);
    MOCK_APPOINTMENTS = MOCK_APPOINTMENTS.map(app => app._id === id ? { ...app, status: 'cancelled' } : app);
    const target = MOCK_APPOINTMENTS.find(app => app._id === id);
    if (!target) throw new ApiError('Appointment not found', 404);
    return target;
  }
};

// ─── ADMIN APPOINTMENTS ──────────────────────────────────────────────────────

export const fetchAllAppointments = async (token: string): Promise<Appointment[]> => {
  try {
    const result = await authRequest<{ success: boolean; data: Appointment[] }>('/appointments', token);
    return result.data;
  } catch (error) {
    console.warn('[API] fetchAllAppointments fallback to mock:', (error as Error).message);
    return MOCK_APPOINTMENTS;
  }
};

export const updateAppointmentStatus = async (token: string, id: string, status: Appointment['status']): Promise<Appointment> => {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const body = await response.json();
    if (!response.ok) throw new ApiError(body.error || 'Update status failed', response.status);
    return body.data as Appointment;
  } catch (error) {
    console.warn('[API] updateAppointmentStatus fallback to mock:', (error as Error).message);
    MOCK_APPOINTMENTS = MOCK_APPOINTMENTS.map(app => app._id === id ? { ...app, status } : app);
    const target = MOCK_APPOINTMENTS.find(app => app._id === id);
    if (!target) throw new ApiError('Appointment not found', 404);
    return target;
  }
};

// ─── ADMIN CATALOG CRUD (SERVICES) ─────────────────────────────────────────

export const createServiceAdmin = async (token: string, data: Partial<Service>): Promise<Service> => {
  try {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok) throw new ApiError(body.error || 'Create service failed', response.status);
    return body.data as Service;
  } catch (error) {
    console.warn('[API] createServiceAdmin fallback:', (error as Error).message);
    const newService: Service = {
      _id: `srv_${Date.now()}`,
      name: data.name || 'Nuevo Servicio',
      description: data.description || '',
      price: data.price || 0,
      duration: data.duration || 30,
      image: data.image || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
    };
    MOCK_SERVICES.unshift(newService);
    return newService;
  }
};

export const updateServiceAdmin = async (token: string, id: string, data: Partial<Service>): Promise<Service> => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok) throw new ApiError(body.error || 'Update service failed', response.status);
    return body.data as Service;
  } catch (error) {
    console.warn('[API] updateServiceAdmin fallback:', (error as Error).message);
    const idx = MOCK_SERVICES.findIndex(s => s._id === id);
    if (idx !== -1) MOCK_SERVICES[idx] = { ...MOCK_SERVICES[idx], ...data };
    return MOCK_SERVICES[idx];
  }
};

export const deleteServiceAdmin = async (token: string, id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json();
      throw new ApiError(body.error || 'Delete service failed', response.status);
    }
  } catch (error) {
    console.warn('[API] deleteServiceAdmin fallback:', (error as Error).message);
    const idx = MOCK_SERVICES.findIndex(s => s._id === id);
    if (idx !== -1) MOCK_SERVICES.splice(idx, 1);
  }
};

// ─── ADMIN CATALOG CRUD (BARBERS) ──────────────────────────────────────────

export const createBarberAdmin = async (token: string, data: Partial<Barber>): Promise<Barber> => {
  try {
    const response = await fetch(`${API_URL}/barbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok) throw new ApiError(body.error || 'Create barber failed', response.status);
    return body.data as Barber;
  } catch (error) {
    console.warn('[API] createBarberAdmin fallback:', (error as Error).message);
    const newBarber: Barber = {
      _id: `barb_${Date.now()}`,
      name: data.name || 'Nuevo Barbero',
      bio: data.bio || '',
      image: data.image || 'https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=2070&auto=format&fit=crop',
      specialties: data.specialties || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
    MOCK_BARBERS.unshift(newBarber);
    return newBarber;
  }
};

export const updateBarberAdmin = async (token: string, id: string, data: Partial<Barber>): Promise<Barber> => {
  try {
    const response = await fetch(`${API_URL}/barbers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok) throw new ApiError(body.error || 'Update barber failed', response.status);
    return body.data as Barber;
  } catch (error) {
    console.warn('[API] updateBarberAdmin fallback:', (error as Error).message);
    const idx = MOCK_BARBERS.findIndex(b => b._id === id);
    if (idx !== -1) MOCK_BARBERS[idx] = { ...MOCK_BARBERS[idx], ...data };
    return MOCK_BARBERS[idx];
  }
};

export const deleteBarberAdmin = async (token: string, id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/barbers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json();
      throw new ApiError(body.error || 'Delete barber failed', response.status);
    }
  } catch (error) {
    console.warn('[API] deleteBarberAdmin fallback:', (error as Error).message);
    const idx = MOCK_BARBERS.findIndex(b => b._id === id);
    if (idx !== -1) MOCK_BARBERS.splice(idx, 1);
  }
};

// ─── ADMIN USER MANAGEMENT ─────────────────────────────────────────────────

export const fetchUsersAdmin = async (token: string): Promise<User[]> => {
  try {
    const result = await authRequest<{ success: boolean; data: User[] }>('/users', token);
    return result.data;
  } catch (error) {
    console.warn('[API] fetchUsersAdmin fallback:', (error as Error).message);
    return MOCK_USERS;
  }
};

export const updateUserAdmin = async (token: string, id: string, data: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok) throw new ApiError(body.error || 'Update user failed', response.status);
    return body.data as User;
  } catch (error) {
    console.warn('[API] updateUserAdmin fallback:', (error as Error).message);
    const idx = MOCK_USERS.findIndex(u => u._id === id || u.publicId === id);
    if (idx !== -1) MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data };
    return MOCK_USERS[idx];
  }
};

export const deleteUserAdmin = async (token: string, id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json();
      throw new ApiError(body.error || 'Delete user failed', response.status);
    }
  } catch (error) {
    console.warn('[API] deleteUserAdmin fallback:', (error as Error).message);
    const idx = MOCK_USERS.findIndex(u => u._id === id || u.publicId === id);
    if (idx !== -1) MOCK_USERS.splice(idx, 1);
  }
};


