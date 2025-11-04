const Camp = require('../models/campModel');
const User = require('../models/userModel');
/**
 * @desc    Create a new camp
 * @route   POST /api/camps
 * @access  Private/Admin or Private/Organizer
 */
const createCamp = async (req, res) => {
    try {
        // --- FIX: Added staffPin ---
        const { name, location, address, startDate, endDate, campAccessCode, staffPin, vaccineInventory, staff } = req.body;

        // Check if camp access code already exists
        const codeExists = await Camp.findOne({ campAccessCode });
        if (codeExists) {
            return res.status(400).json({ message: 'This Camp Access Code is already taken' });
        }

        const camp = new Camp({
            name,
            organizedBy: req.user._id, // Set organizer to the logged-in user
            location,
            address,
            startDate,
            endDate,
            campAccessCode,
            staffPin, // <-- ADDED
            staff: staff || [], // Optional: add initial staff
            vaccineInventory: vaccineInventory || [], // Optional: add initial inventory
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

        if (req.user.role !== 'admin' && camp.organizedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Update fields
        camp.name = req.body.name || camp.name;
        camp.address = req.body.address || camp.address;
        camp.startDate = req.body.startDate || camp.startDate;
        camp.endDate = req.body.endDate || camp.endDate;
        camp.status = req.body.status || camp.status;
        camp.campAccessCode = req.body.campAccessCode || camp.campAccessCode;
        camp.staffPin = req.body.staffPin || camp.staffPin; // <-- ADDED

        // --- FIX: Better update logic for arrays ---
        // The "||" method is bad. If you pass an empty array [], it's "truthy" 
        // and will wipe your data. This new logic only updates if the field exists in req.body.
        
        if (req.body.vaccineInventory !== undefined) {
            camp.vaccineInventory = req.body.vaccineInventory;
        }
         if (req.body.staff !== undefined) {
            camp.staff = req.body.staff;
        }

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

        // --- FIX: .remove() is deprecated ---
        await camp.deleteOne(); // <-- CHANGED
        res.json({ message: 'Camp removed' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// --- NEW FUNCTIONS (from our last discussion) ---
// You need to add these to your controller file for the staff login to work.

/**
 * @desc    Login for camp staff
 * @route   POST /api/camps/staff-login
 * @access  Public
 */
const staffLogin = async (req, res) => {
    try {
        const { campAccessCode, staffIdentifier, pin } = req.body;

        const camp = await Camp.findOne({ campAccessCode });
        if (!camp) {
            return res.status(404).json({ message: 'Camp not found' });
        }

        const now = new Date();
        if (now < camp.startDate) {
            return res.status(403).json({ message: 'Camp has not started yet' });
        }
        if (now > camp.endDate) {
            return res.status(403).json({ message: 'Camp has already ended' });
        }
        
        const isStaff = camp.staff.some(
            member => member.toLowerCase() === staffIdentifier.toLowerCase()
        );

        if (!isStaff) {
            return res.status(401).json({ message: 'Staff member not registered for this camp' });
        }

        if (camp.staffPin === pin) { 
            res.json({
                message: 'Login successful',
                staffIdentifier: staffIdentifier,
                campId: camp._id,
                campName: camp.name,
            });
        } else {
            return res.status(401).json({ message: 'Invalid PIN' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Add a staff member to a camp
 * @route   PUT /api/camps/:id/addstaff
 * @access  Private/Organizer or Private/Admin
 */
const addStaffToCamp = async (req, res) => {
    try {
        const { staffIdentifier } = req.body; // e.g., "staff@example.com"
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ message: 'Camp not found' });
        }

        if (camp.organizedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
             return res.status(401).json({ message: 'User not authorized' });
        }

        if (camp.staff.includes(staffIdentifier)) {
            return res.status(400).json({ message: 'Staff member already in list' });
        }

        camp.staff.push(staffIdentifier);
        await camp.save();

        res.status(201).json(camp.staff);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
//get specific camps by user id with user all information   
const getCampsByUserId = async (req, res) => {
    try {
        console.log(req.user._id);
        const camps = await Camp.find({ organizedBy: req.user._id });
        const user = await User.findById(req.user._id);
        res.json({ camps, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
//get staff by camp id
const getStaffByCampId = async (req, res) => {
        try {
            // Use .select('staff') to get *only* the staff field
            const camp = await Camp.findById(req.params.id).select('staff');
            
            if (!camp) {
                 return res.status(404).json({ message: 'Camp not found' });
            }
    
            res.json(camp.staff); // <-- Just send the staff array
        } catch (error) {
            res.status(500).json({ message: 'Server Error: ' + error.message });
        }
    };

//get camp detial by camp id with all detail like participants, staff and camp detail participant(user data user model)fetch using appointment model
const getCampDetailByCampId = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);
        const appointments = await Appointment.find({ camp: req.params.id });
        const user = await User.find({ _id: { $in: appointments.map(p => p.beneficiary) } });
            res.json({ camp, participants: user.data });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// --- UPDATE YOUR EXPORTS ---
module.exports = {
    createCamp,
    getAllCamps,
    getCampById,
    updateCamp,
    deleteCamp,
    staffLogin,     // <-- ADD THIS
    addStaffToCamp, // <-- ADD THIS
    getCampsByUserId, // <-- ADD THIS
    getStaffByCampId, // <-- ADD THIS
    getCampDetailByCampId, // <-- ADD THIS
};