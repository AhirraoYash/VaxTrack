import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import campService from '../api/campService';
import DeleteCampModal from '../components/DeleteCampModal'; 
import { ExclamationTriangleIcon, UsersIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/20/solid';

const TABS = [
  { name: 'Details', icon: DocumentTextIcon },
  { name: 'Staff', icon: UserGroupIcon },
  { name: 'Participants', icon: UsersIcon },
];

function CampDetailPage() {
  const { id: campId } = useParams();
  const navigate = useNavigate();

  const [camp, setCamp] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const campRes = await campService.getCampById(campId);
        console.log("Camp by id");
        console.log(campRes);
        setCamp(campRes.data);

        // This uses your MOCKED data function from the service
        const participantRes = await campService.getCampParticipants(campId);
        setParticipants(participantRes.data);

      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch camp data.';
        setError(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campId]);

  const handleDeleteCamp = async () => {
    setDeleteLoading(true);
    try {
      await campService.deleteCamp(campId); // Make sure deleteCamp is in your service
      setIsModalOpen(false);
      navigate('/my-camps');
    } catch (err) {
      console.error('Failed to delete camp', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Camp Details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!camp) return <div className="p-8 text-center">Camp not found.</div>;

  return (
    <>
      <div className="bg-gray-100 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{camp.name}</h1>
                <p className="text-gray-600 mt-1">{camp.address}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
              >
                {/* --- CORRECTED ICON --- */}
                <ExclamationTriangleIcon className="w-5 h-5" />
                Delete Camp
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="border-b border-gray-300">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.name
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            {activeTab === 'Details' && <CampDetailsTab camp={camp} />}
            {activeTab === 'Staff' && <StaffTab staff={camp.staff} />}
            {activeTab === 'Participants' && <ParticipantsTab participants={participants} />}
          </div>

        </div>
      </div>
      
      <DeleteCampModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteCamp}
        loading={deleteLoading}
        campName={camp.name}
      />
    </>
  );
}

// --- Tab Content Components ---

function CampDetailsTab({ camp }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Camp Information</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
        <div>
          <dt className="text-sm font-medium text-gray-500">Access Code</dt>
          <dd className="mt-1 text-lg font-mono p-2 bg-gray-100 rounded-md inline-block">{camp.campAccessCode}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Staff PIN</dt>
          <dd className="mt-1 text-lg font-mono p-2 bg-gray-100 rounded-md inline-block">{camp.staffPin}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Start Date</dt>
          <dd className="mt-1 text-gray-900">{new Date(camp.startDate).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">End Date</dt>
          <dd className="mt-1 text-gray-900">{new Date(camp.endDate).toLocaleString()}</dd>
        </div>
         <div>
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="mt-1 text-gray-900">
             <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                camp.status === 'active' ? 'bg-green-100 text-green-800' :
                camp.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {camp.status}
              </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function StaffTab({ staff }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Staff List ({staff.length})</h3>
      {staff.length === 0 ? (
        <p className="text-gray-500">No staff members have been added to this camp yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border rounded-md">
          {staff.map((staffId, index) => (
            <li key={index} className="py-3 px-4 flex justify-between items-center">
              <span className="text-gray-700">{staffId}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ParticipantsTab({ participants }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Participants ({participants.length})</h3>
      {participants.length === 0 ? (
        <p className="text-gray-500">No participants have registered for this camp yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border rounded-md">
          {participants.map((p) => (
            <li key={p._id} className="py-3 px-4">
              <p className="font-medium text-gray-800">{p.name}</p>
              <p className="text-sm text-gray-500">{p.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CampDetailPage;