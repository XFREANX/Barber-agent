const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Models
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const User = require('../models/User');

const servicesData = [
  {
    name: 'Corte Clásico',
    description: 'Corte tradicional con tijera y máquina, incluye lavado y peinado con productos premium.',
    price: 25,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop'
  },
  {
    name: 'Arreglo de Barba Royale',
    description: 'Perfilado detallado con toalla caliente, aceites esenciales y afeitado tradicional con navaja.',
    price: 15,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop'
  },
  {
    name: 'Corte + Barba (Combo)',
    description: 'El servicio completo para el caballero moderno. Máxima atención al detalle.',
    price: 35,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1593702295094-ada75dc4d19d?q=80&w=2070&auto=format&fit=crop'
  },
  {
    name: 'Afeitado de Cabeza',
    description: 'Afeitado a navaja para un acabado suave y duradero. Incluye masaje hidratante.',
    price: 20,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1512690118294-700346097746?q=80&w=2070&auto=format&fit=crop'
  }
];

const barbersData = [
  {
    name: 'Marco "The Blade"',
    bio: 'Más de 10 años de experiencia en cortes clásicos y fades modernos.',
    image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=2070&auto=format&fit=crop'
  },
  {
    name: 'Sofia Barber',
    bio: 'Especialista en diseño de barba y tratamientos faciales para caballeros.',
    image: 'https://images.unsplash.com/photo-1613483445507-68641178229b?q=80&w=2070&auto=format&fit=crop'
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Service.deleteMany();
    await Barber.deleteMany();
    await User.deleteMany();
    
    console.log('🗑️ Datos antiguos eliminados');

    // Insert Services
    const createdServices = await Service.insertMany(servicesData);
    console.log(`✅ ${createdServices.length} Servicios insertados`);

    // Insert Barbers (and link to services)
    const barbersWithServices = barbersData.map((barber, index) => ({
      ...barber,
      specialties: createdServices.slice(index * 2, (index + 1) * 2).map(s => s._id)
    }));
    await Barber.insertMany(barbersWithServices);
    console.log(`✅ ${barbersWithServices.length} Barberos insertados`);

    // Insert Admin User (hash password before storing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    await User.create({
      name: 'Admin',
      email: 'admin@barber.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('✅ Usuario Admin creado (admin@barber.com / password123)');

    console.log('🚀 Base de datos lista!');
    process.exit();
  } catch (err) {
    console.error('❌ Error en el seeder:', err);
    process.exit(1);
  }
};

seedDB();
