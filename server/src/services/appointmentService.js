const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

/**
 * Service to handle appointment business logic
 */
class AppointmentService {
  /**
   * Validates and creates a new appointment
   * @param {Object} appointmentData
   * @returns {Object} created appointment
   * @throws {Error} if validation fails or conflict exists
   */
  static async createAppointment(appointmentData) {
    const { name, email, phone, date, time, service, barber } = appointmentData;

    // Validation of required fields
    if (!name || !email || !phone || !date || !time || !service || !barber) {
      const err = new Error('All fields are required: name, email, phone, date, time, service, barber');
      err.statusCode = 400;
      throw err;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      const err = new Error('Invalid date format. Expected YYYY-MM-DD');
      err.statusCode = 400;
      throw err;
    }

    // Validate valid logical date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      const err = new Error('Invalid date value');
      err.statusCode = 400;
      throw err;
    }

    // Validate no dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      const err = new Error('Appointment date cannot be in the past');
      err.statusCode = 400;
      throw err;
    }

    // Validate time format (HH:MM, 24h)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      const err = new Error('Invalid time format. Expected HH:MM (24-hour format)');
      err.statusCode = 400;
      throw err;
    }

    // Lookup service to set totalPrice
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      const err = new Error('Selected service not found');
      err.statusCode = 404;
      throw err;
    }

    // Application-level conflict check before inserting.
    const conflict = await Appointment.findOne({
      barber,
      date: parsedDate,
      time,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      const err = new Error('This time slot is already booked for the selected barber. Please choose a different time.');
      err.statusCode = 409;
      throw err;
    }

    // Map form input explicitly to prevent pollution
    return await Appointment.create({
      clientName: name.trim(),
      clientEmail: email.toLowerCase().trim(),
      clientPhone: phone.trim(),
      date,
      time,
      service,
      barber,
      totalPrice: serviceDoc.price,
    });
  }
}

module.exports = AppointmentService;
