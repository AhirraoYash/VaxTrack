const Camp = require('../models/campModel');

/**
 * @desc    Create a new camp
 * @route   POST /api/camps
 * @access  Private/Admin or Private/Organizer
 */
const createCamp = async (req, res) => {
    try {
        const { name, location, address, startDate, endDate, campAccessCode, vaccineInventory } = req.body;

        const camp = new Camp({
            name,
            organizedBy: req.user._id, // Set organizer to the logged-in user
            location,
            address,
            startDate,
            endDate,
            campAccessCode,
            vaccineInventory,
        });

        const createdCamp = await camp.save();
        res.status(201).json(createdCamp);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Get all camps
 * @route   GET /api/camps
 * @access  Public
 */
const getAllCamps = async (req, res) => {
    try {
        // We can add filtering here later, e.g., only show active/upcoming
        const camps = await Camp.find({}).populate('organizedBy', 'name email');
        res.json(camps);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Get a single camp by ID
 * @route   GET /api/camps/:id
 * @access  Public
 */
const getCampById = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);

        if (camp) {
            res.json(camp);
        } else {
            res.status(404).json({ message: 'Camp not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Update a camp
 * @route   PUT /api/camps/:id
 * @access  Private/Admin or Private/Organizer
 */
const updateCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ message: 'Camp not found' });
        }

        // Check if the user is an admin or the organizer of this camp
        if (req.user.role !== 'admin' && camp.organizedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Update fields
        camp.name = req.body.name || camp.name;
        camp.address = req.body.address || camp.address;
        camp.startDate = req.body.startDate || camp.startDate;
        camp.endDate = req.body.endDate || camp.endDate;
        camp.status = req.body.status || camp.status;
        camp.vaccineInventory = req.body.vaccineInventory || camp.vaccineInventory;
        camp.staff = req.body.staff || camp.staff;

        const updatedCamp = await camp.save();
        res.json(updatedCamp);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Delete a camp
 * @route   DELETE /api/camps/:id
 * @access  Private/Admin or Private/Organizer
 */
const deleteCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ message: 'Camp not found' });
        }

        if (req.user.role !== 'admin' && camp.organizedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await camp.remove();
        res.json({ message: 'Camp removed' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = {
    createCamp,
    getAllCamps,
    getCampById,
    updateCamp,
    deleteCamp,
};