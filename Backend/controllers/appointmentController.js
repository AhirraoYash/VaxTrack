const Appointment = require('../models/appointmentModel');
const Camp = require('../models/campModel');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private/Beneficiary
 */
const bookAppointment = async (req, res) => {
    const { camp, vaccine, slotDate } = req.body;

    try {
        const campExists = await Camp.findById(camp);
        if (!campExists) {
            return res.status(404).json({ message: 'Camp not found' });
        }

        // Optional: Check vaccine inventory before booking
        const vaccineInStock = campExists.vaccineInventory.find(
            (item) => item.vaccine.toString() === vaccine && item.quantity > 0
        );

        // if (!vaccineInStock) {
        //     return res.status(400).json({ message: 'Vaccine not available at this camp' });
        // }

        const appointment = new Appointment({
            beneficiary: req.user._id,
            camp,
            vaccine,
            slotDate,
        });
        console.log("appointment", appointment);
        const createdAppointment = await appointment.save();

         

        res.status(201).json(createdAppointment);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Get logged in user's appointments
 * @route   GET /api/appointments/myappointments
 * @access  Private
 */
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ beneficiary: req.user._id })
            .populate('camp', 'name address')
            .populate('vaccine', 'name');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Update appointment status
 * @route   PUT /api/appointments/:id/status
 * @access  Private/Vaccinator or Admin
 */
const updateAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            appointment.status = req.body.status || appointment.status;
            const updatedAppointment = await appointment.save();
            res.json(updatedAppointment);
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};


module.exports = {
    bookAppointment,
    getMyAppointments,
    updateAppointmentStatus,
};