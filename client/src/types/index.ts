export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Barber {
  _id: string;
  name: string;
  bio: string;
  image: string;
  specialties?: (Service | string)[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface Appointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  barber: Barber | string;
  service: Service | string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  barber: string;
}

export interface BookingInitialData {
  serviceId?: string;
  serviceName?: string;
  barberId?: string;
  barberName?: string;
}

// --- API Response Types ---

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
