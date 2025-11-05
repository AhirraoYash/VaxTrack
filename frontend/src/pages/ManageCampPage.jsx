import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import campService from "../api/campService.js";
// import { useAuth } from '../context/AuthContext';

// --- PDF Generation Imports (FIXED) ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Reusable Modal Component ---
const Modal = ({ children, onClose, title }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={28} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// --- Main Page Component ---
const ManageCampPage = () => {
  const { id: campId } = useParams();
  const navigate = useNavigate();

  // Real data states
  const [camp, setCamp] = useState(null);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showDeleteStaff, setShowDeleteStaff] = useState(null); // Staff email
  const [showDeleteCamp, setShowDeleteCamp] = useState(false);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    const fetchCampData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await campService.getCampDetailByCampId(campId);

        setCamp(data.campInfo);
        setStaff(data.campInfo.staff || []);
        setParticipants(data.participants || []);
      } catch (err) {
        console.error("Failed to fetch camp details:", err);
        setError("Could not load camp details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (campId) {
      fetchCampData();
    }
  }, [campId]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const staffData = { staffIdentifier: email };

    try {
      const newStaffList = await campService.addStaffToCamp(campId, staffData);
      setStaff(newStaffList);
      setShowAddStaff(false);
    } catch (err) {
      console.error("Failed to add staff:", err);
      alert(err.response?.data?.message || "Failed to add staff");
    }
  };

  // UI-only delete (as requested)
  const handleDeleteStaff = async () => {
    setStaff(staff.filter((email) => email !== showDeleteStaff));
    setShowDeleteStaff(null);
  };

  // --- UPDATED: PDF Download Function (FIXED) ---
  const handleDownloadReport = () => {
    if (!camp) return; // Make sure camp data is loaded

    // 1. Create a new PDF document
    const doc = new jsPDF();

    // 2. Add Camp Details (Title, etc.)
    doc.setFontSize(20);
    doc.text(camp.name, 14, 22); // Title
    doc.setFontSize(12);
    doc.text(camp.address, 14, 30);
    doc.text(`Date: ${new Date(camp.date).toLocaleDateString()}`, 14, 38);
    doc.text(`Total Participants: ${participants.length}`, 14, 46);

    // 3. Add Staff Table
    const staffHead = [["Staff Email"]];
    const staffBody = staff.map((email) => [email]);

    autoTable(doc, {
      head: staffHead,
      body: staffBody,
      startY: 55, // Start table after the camp details
      headStyles: { fillColor: [22, 160, 133] }, // Green header
      didDrawPage: (data) => {
        // Add a title to this section
        doc.setFontSize(16);
        doc.text("Camp Staff", 14, data.settings.startY - 5);
      },
    });

    // 4. Add Participant Table
    const participantHead = [["Name", "Contact", "Status"]];
    const participantBody = participants.map((p) => [
      p.beneficiary?.name || "N/A",
      p.beneficiary?.phoneNumber || "N/A",
      p.status,
    ]);

    autoTable(doc, {
      head: participantHead,
      body: participantBody,
      startY: doc.lastAutoTable.finalY + 15, // Use doc.lastAutoTable
      headStyles: { fillColor: [41, 128, 185] }, // Blue header
      didDrawPage: (data) => {
        // Add a title to this section
        doc.setFontSize(16);
        doc.text("Camp Participants", 14, data.settings.startY - 5);
      },
    });

    // 5. Save the PDF
    doc.save(`camp-report-${camp.name.replace(/\s+/g, "-")}.pdf`);
  };
  // --- END UPDATED FUNCTION ---

  // --- Real Delete Camp Function ---
  const handleDeleteCamp = async () => {
    try {
      await campService.deleteCamp(campId);
      setShowDeleteCamp(false);
      navigate("/my-camps");
    } catch (err) {
      console.error("Failed to delete camp:", err);
      alert(err.response?.data?.message || "Failed to delete camp");
    }
  };

  // --- Status Badge ---
  const StatusBadge = ({ status }) => {
    let colorClasses = "bg-yellow-100 text-yellow-800"; // scheduled
    if (status === "completed") {
      colorClasses = "bg-green-100 text-green-800";
    } else if (status === "cancelled" || status === "noShow") {
      colorClasses = "bg-red-100 text-red-800";
    }
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // --- Loading / Error / Not Found States ---
  if (loading) {
    return <div className="text-center mt-20">Loading camp details...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600">{error}</div>;
  }

  if (!camp) {
    return <div className="text-center mt-20">Camp not found.</div>;
  }

  // --- Component JSX ---
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* --- 1. Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">{camp.name}</h1>
          <p className="text-lg text-gray-500 mt-1">{camp.address}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadReport}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
          >
            <Download size={20} />
            Download Report
          </button>

          <button
            onClick={() => setShowDeleteCamp(true)}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition duration-300 font-semibold"
          >
            <Trash2 size={20} />
            Delete Camp
          </button>
        </div>
      </div>

      {/* --- 2. Main Grid (Staff & Participants) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Column 1: Staff Management --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Manage Staff</h2>
              <button
                onClick={() => setShowAddStaff(true)}
                className="flex items-center gap-2 bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition duration-300 font-semibold text-sm"
              >
                <Plus size={16} />
                Add Staff
              </button>
            </div>

            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                Camp access code
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Staff use this code to log in to the VaxTrack camp dashboard.
              </p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <input
                  type={showPin ? "text" : "password"}
                  value={camp.campAccessCode || "****"}
                  readOnly
                  className="text-2xl font-bold tracking-widest bg-transparent border-none p-0 focus:ring-0 w-full"
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                Staff Access PIN
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Staff use this PIN to log in to the VaxTrack camp dashboard.
              </p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <input
                  type={showPin ? "text" : "password"}
                  value={camp.staffPin || "****"}
                  readOnly
                  className="text-2xl font-bold tracking-widest bg-transparent border-none p-0 focus:ring-0 w-full"
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {staff.length === 0 && (
                <p className="text-gray-500">No staff members added yet.</p>
              )}
              {staff.map((email) => (
                <div
                  key={email}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-700">{email}</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteStaff(email)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Column 2: Participant List --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                Camp Participants ({participants.length})
              </h2>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-4 font-semibold text-gray-600">Name</th>
                    <th className="p-4 font-semibold text-gray-600">Contact</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participants.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="p-4">{app.beneficiary?.name || "N/A"}</td>
                      <td className="p-4 text-gray-600">
                        {app.beneficiary?.phoneNumber || "N/A"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. Modals --- */}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <Modal onClose={() => setShowAddStaff(false)} title="Add New Staff">
          <form onSubmit={handleAddStaff}>
            <div className="mb-6">
              <label
                className="block text-gray-700 font-semibold mb-2"
                htmlFor="email"
              >
                Staff Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email of the staff member"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
            >
              Add Staff Member
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Staff Confirmation Modal */}
      {showDeleteStaff && (
        <Modal
          onClose={() => setShowDeleteStaff(null)}
          title="Confirm Deletion"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove
            <strong className="text-gray-800"> {showDeleteStaff} </strong>
            from the staff list?
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowDeleteStaff(null)}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteStaff}
              className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 font-semibold"
            >
              Yes, Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Camp Confirmation Modal */}
      {showDeleteCamp && (
        <Modal
          onClose={() => setShowDeleteCamp(false)}
          title="Confirm Camp Deletion"
        >
          <p className="text-gray-600 mb-2">
            Are you sure you want to permanently delete this camp?
          </p>
          <p className="font-semibold text-red-700 bg-red-50 p-4 rounded-lg mb-6 flex items-center gap-2">
            <ShieldAlert size={20} />
            This action is irreversible.
          </p>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowDeleteCamp(false)}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCamp}
              className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 font-semibold"
            >
              Yes, Delete Camp
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageCampPage;