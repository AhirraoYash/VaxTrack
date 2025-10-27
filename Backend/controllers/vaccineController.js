const Vaccine = require('../models/vaccineModel');

/**
 * @desc    Create a new vaccine
 * @route   POST /api/vaccines
 * @access  Private/Admin
 */
const createVaccine = async (req, res) => {
    try {
        const { name, description, totalDosesInSystem } = req.body;

        const vaccineExists = await Vaccine.findOne({ name });
        if (vaccineExists) {
            return res.status(400).json({ message: 'Vaccine with this name already exists' });
        }

        const vaccine = new Vaccine({
            name,
            description,
            totalDosesInSystem, // This can be 0 or an initial amount
        });

        const createdVaccine = await vaccine.save();
        res.status(201).json(createdVaccine);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Get all vaccines
 * @route   GET /api/vaccines
 * @access  Public (or Private if you prefer)
 */
const getAllVaccines = async (req, res) => {
    try {
        const vaccines = await Vaccine.find({});
        res.json(vaccines);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Get a single vaccine by ID
 * @route   GET /api/vaccines/:id
 * @access  Public (or Private)
 */
const getVaccineById = async (req, res) => {
    try {
        const vaccine = await Vaccine.findById(req.params.id);
        if (vaccine) {
            res.json(vaccine);
        } else {
            res.status(404).json({ message: 'Vaccine not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Update a vaccine
 * @route   PUT /api/vaccines/:id
 * @access  Private/Admin
 */
const updateVaccine = async (req, res) => {
    try {
        const vaccine = await Vaccine.findById(req.params.id);

        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        // Update fields
        vaccine.name = req.body.name || vaccine.name;
        vaccine.description = req.body.description || vaccine.description;
        vaccine.totalDosesInSystem = req.body.totalDosesInSystem !== undefined 
            ? req.body.totalDosesInSystem 
            : vaccine.totalDosesInSystem;

        const updatedVaccine = await vaccine.save();
        res.json(updatedVaccine);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Delete a vaccine
 * @route   DELETE /api/vaccines/:id
 * @access  Private/Admin
 */
const deleteVaccine = async (req, res) => {
    try {
        const vaccine = await Vaccine.findById(req.params.id);

        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        await vaccine.remove(); // or vaccine.deleteOne()
        res.json({ message: 'Vaccine removed' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = {
    createVaccine,
    getAllVaccines,
    getVaccineById,
    updateVaccine,
    deleteVaccine,
};