const Camp = require('../models/campModel');
const User = require('../models/userModel');
const Appointment = require('../models/appointmentModel');
const Vaccine = require('../models/vaccineModel');
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
        console.log("route file");
        console.log(req.body);

        // --- FIX 1: Use the correct keys from req.body ---
        const { campAccessCode, staffEmail, staffPin } = req.body;

        const camp = await Camp.findOne({ campAccessCode });
        if (!camp) {
            return res.status(404).json({ message: 'Camp not found' });
        }
        console.log(camp);
    
        
        // --- FIX 2: Check against staffEmail, not staffIdentifier ---
        const isStaff = camp.staff.some(
            member => member.toLowerCase() === staffEmail.toLowerCase()
        );
        console.log("Is Staff");
        console.log(isStaff);

        if (!isStaff) {
            return res.status(401).json({ message: 'Staff member not registered for this camp' });
        }

        // --- FIX 3: Compare camp.staffPin with staffPin, not pin ---
        if (camp.staffPin === staffPin) { 
            res.json({
                message: 'Login successful',
                // Send back staffEmail as the identifier
                staffIdentifier: staffEmail, 
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

/**
 * @desc    Get camp detail by camp id with all details (camp info, staff, and participants)
 * @route   GET /api/camps/details/:id  <-- (You might need to add this route)
 * @access  Private/Organizer
 */
const getCampDetailByCampId = async (req, res) => {
    try {
        // --- Step 1: Get the Main Camp Details ---
        // We will .populate() the organizer's name and email
        const camp = await Camp.findById(req.params.id)
            .populate('organizedBy', 'name email');

        if (!camp) {
            return res.status(404).json({ message: 'Camp not found' });
        }

        // --- Step 2: Get Staff Details ---
        // Find all users whose email is in the camp's 'staff' array
        // We only select the fields we need: name, email, and role
        const staffDetails = await User.find({ 
            email: { $in: camp.staff } 
        }).select('name email role');

        // --- Step 3: Get Participant Details ---
        // Find all appointments for this camp
        // We use .populate() to automatically get the user details ('beneficiary')
        // and the vaccine details for each appointment.
        const participantAppointments = await Appointment.find({ 
            camp: req.params.id 
        })
        .populate('beneficiary', 'name email uniqueId phoneNumber') // Get user info
        .populate('vaccine', 'name'); // Get vaccine info

        // --- Step 4: Combine and Send ---
        res.json({
            campInfo: camp,
            staff: staffDetails,
            participants: participantAppointments,
        });

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
    staffLogin,    
    addStaffToCamp,
    getCampsByUserId, 
    getStaffByCampId, 
    getCampDetailByCampId,  
};