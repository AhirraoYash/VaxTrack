// src/pages/RegisterPage.jsx (Two-Column Layout - Corrected)

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    // Hooks must be called inside the component function
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        uniqueId: '', // For Aadhaar Card Number
        address: '',
        role: 'beneficiary', // Default role
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // --- Validation logic ---
        if (formData.password.length < 8) {
            return setError('Password must be at least 8 characters long.');
        }
        if (!/^\d{10}$/.test(formData.phoneNumber)) {
            return setError('Please enter a valid 10-digit phone number.');
        }
        if (!/^\d{12}$/.test(formData.uniqueId)) {
            return setError('Please enter a valid 12-digit Aadhaar number.');
        }
        if (!formData.address.trim()) {
            return setError('Please enter your address.');
        }
        console.log("submit button is clicked");
        console.log(formData);
        setLoading(true);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
             if (err.response && err.response.data) {
    console.error('SERVER ERROR:', err.response.data);
    // You can even set the error to be the specific backend message
    setError(err.response.data.message || 'An unexpected error occurred.');
  } else {
    // If there's no specific backend message, use a generic one
    setError('Failed to register. Please check your connection.');
    console.error(err);
  }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-full bg-gray-50 p-4">
            <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg my-8 overflow-hidden">
                {/* --- Left Column (Branding/Image) --- */}
                <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-blue-600 text-white p-8 rounded-l-lg">
                    <h1 className="text-4xl font-bold mb-4">VaxTrack 💉</h1>
                    <p className="text-center text-blue-100">Streamlining vaccinations for a healthier tomorrow. Join our network of beneficiaries and organizers.</p>
                </div>

                {/* --- Right Column (Form) --- */}
                <div className="w-full lg:w-1/2 p-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Create an Account</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
                        
                        <input type="text" name="name" value={formData.name} placeholder="Full Name" onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <input type="email" name="email" value={formData.email} placeholder="Email Address" onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <input type="password" name="password" value={formData.password} placeholder="Password" onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} placeholder="Phone Number" onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <input type="text" name="uniqueId" value={formData.uniqueId} placeholder="Aadhaar Card Number" onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <textarea name="address" value={formData.address} placeholder="Full Address" onChange={handleChange} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" required></textarea>
                        
                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center text-gray-700">
                                <input type="radio" name="role" value="beneficiary" checked={formData.role === 'beneficiary'} onChange={handleChange} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                Beneficiary
                            </label>
                            <label className="flex items-center text-gray-700">
                                <input type="radio" name="role" value="organizer" checked={formData.role === 'organizer'} onChange={handleChange} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                Organizer
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition duration-300 disabled:bg-blue-400" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                        
                        <p className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

//another Style
// src/pages/RegisterPage.jsx (Minimalist & Clean Style)

// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';

// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     name: '', email: '', password: '', phoneNumber: '', uniqueId: '', address: '', role: 'beneficiary',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     // --- Validation logic... ---
//     if (formData.password.length < 6) return setError('Password must be at least 6 characters long.');
//     if (!/^\d{10}$/.test(formData.phoneNumber)) return setError('Please enter a valid 10-digit phone number.');
//     if (!/^\d{12}$/.test(formData.uniqueId)) return setError('Please enter a valid 12-digit Aadhaar number.');

//     setLoading(true);
//     try {
//       await register(formData);
//       navigate('/dashboard');
//     } catch (err) {
//       setError('Failed to register. This email might already be in use.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto my-8 p-4">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-800">Create an Account</h2>
//         <p className="text-gray-500">Join VaxTrack to manage your vaccinations seamlessly.</p>
//       </div>
      
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}
        
//         {/* --- Minimalist Input Fields --- */}
//         <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full px-1 py-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500" required />
//         <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full px-1 py-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500" required />
//         <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full px-1 py-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500" required />
//         <input type="tel" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="w-full px-1 py-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500" required />
//         <input type="text" name="uniqueId" placeholder="Aadhaar Card Number" onChange={handleChange} className="w-full px-1 py-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500" required />
//         <textarea name="address" placeholder="Address" onChange={handleChange} className="w-full px-1 py-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500" rows="2" required></textarea>

//         {/* --- Simple Role Selection --- */}
//         <div className="flex gap-4">
//             <label className="flex items-center w-1/2">
//               <input type="radio" name="role" value="beneficiary" checked={formData.role === 'beneficiary'} onChange={handleChange} className="mr-2" />
//               I'm a Beneficiary
//             </label>
//             <label className="flex items-center w-1/2">
//               <input type="radio" name="role" value="organizer" checked={formData.role === 'organizer'} onChange={handleChange} className="mr-2" />
//               I'm an Organizer
//             </label>
//         </div>

//         <button type="submit" className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition duration-300 disabled:bg-gray-400" disabled={loading}>
//           {loading ? 'Creating Account...' : 'Register'}
//         </button>

//         <p className="text-center text-sm text-gray-500">
//           Already have an account?{' '}
//           <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login here</Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default RegisterPage;