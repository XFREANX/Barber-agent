const API_URL = 'http://localhost:5000/api';

// MOCK DATA para visualización inmediata
const MOCK_SERVICES = [
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

export const fetchServices = async () => {
  // Simulamos un retraso de red para ver el loader
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    const response = await fetch(`${API_URL}/services`);
    if (!response.ok) throw new Error('Backend not reachable');
    const data = await response.json();
    return data.data.length > 0 ? data.data : MOCK_SERVICES;
  } catch (error) {
    console.log('Using Mock Data because backend is not available');
    return MOCK_SERVICES; // Devolvemos los mocks si falla la red
  }
};

const MOCK_BARBERS = [
  {
    _id: '1',
    name: 'Marco "The Blade"',
    bio: 'Maestro del degradado perfecto. Más de 10 años esculpiendo los estilos más precisos de la ciudad.',
    image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=2070&auto=format&fit=crop',
    specialties: ['Corte Clásico', 'Degradados']
  },
  {
    _id: '2',
    name: 'Sofia Barber',
    bio: 'Especialista en cuidado facial y diseño de barba. Transforma cualquier barba rebelde en una obra de arte.',
    image: 'https://images.unsplash.com/photo-1613483445507-68641178229b?q=80&w=2070&auto=format&fit=crop',
    specialties: ['Arreglo de Barba', 'Tratamientos Faciales']
  },
  {
    _id: '3',
    name: 'Arthur Shelby',
    bio: 'Estilo clásico británico. Especialista en cortes a tijera y afeitados tradicionales con toalla caliente.',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2072&auto=format&fit=crop',
    specialties: ['Cortes a Tijera', 'Afeitado Tradicional']
  }
];

export const fetchBarbers = async () => {
  // Simulamos un retraso de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    const response = await fetch(`${API_URL}/barbers`);
    if (!response.ok) throw new Error('Backend not reachable');
    const data = await response.json();
    return data.data.length > 0 ? data.data : MOCK_BARBERS;
  } catch (error) {
    console.log('Using Mock Data for Barbers because backend is not available');
    return MOCK_BARBERS;
  }
};
