import React, { useState } from 'react';
import { api } from '../services/api';
import CommunityFeed from '../components/CommunityFeed';
import { Camera, MapPin, Building, ShieldCheck, CheckCircle2, Newspaper, PlusCircle, ArrowRight } from 'lucide-react';

export default function CitizenPortal() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'report' | 'ward'

  // Current logged in user from localStorage
  const savedUser = localStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  // Report Form State
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(currentUser?.ward || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image showing the civic issue.');
      return;
    }

    setLoading(true);
    setSubmissionSuccess(null);

    const submitWithCoords = async (lat, lon) => {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('description', description);
      formData.append('latitude', lat);
      formData.append('longitude', lon);
      formData.append('city', city);
      formData.append('ward', ward);
      formData.append('user_id', currentUser?.id || 'citizen-guest');
      formData.append('user_name', currentUser?.full_name || 'Active Citizen');

      try {
        const result = await api.createComplaint(formData);
        setSubmissionSuccess(result);
        setDescription('');
        setImage(null);
        setImagePreview(null);
      } catch (err) {
        alert('Network error submitting complaint. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => submitWithCoords(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Fallback coordinates for demo area
          submitWithCoords(23.6889, 86.9661);
        },
        { timeout: 8000 }
      );
    } else {
      submitWithCoords(23.6889, 86.9661);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tab Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-vanilla">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <span>Citizen Governance Hub</span>
            <span className="text-xs bg-vanilla text-raspberry font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs border border-vanilla">
              {currentUser?.ward || currentUser?.city || 'Local Civic Hub'}
            </span>
          </h1>
          <p className="text-pink-grapefruit font-semibold text-sm mt-1">
            Community-powered civic issue reporting, upvoting, and resolution tracking
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-vanilla shadow-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'feed'
                ? 'bg-raspberry text-white shadow-xs'
                : 'text-slate-600 hover:bg-vanilla/40 hover:text-raspberry'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Community Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'report'
                ? 'bg-raspberry text-white shadow-xs'
                : 'text-slate-600 hover:bg-vanilla/40 hover:text-raspberry'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </button>

          <button
            onClick={() => setActiveTab('ward')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'ward'
                ? 'bg-raspberry text-white shadow-xs'
                : 'text-slate-600 hover:bg-vanilla/40 hover:text-raspberry'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>My Ward & Rep</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Public Community Feed */}
      {activeTab === 'feed' && <CommunityFeed currentUser={currentUser} />}

      {/* TAB 2: File New Civic Report */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border-2 border-vanilla p-8 md:p-10">
            <div className="mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-raspberry bg-vanilla px-3 py-1 rounded-full border border-vanilla">
                Multimodal Civic Dispatch
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2.5">Report a Civic Problem</h2>
              <p className="text-slate-600 text-sm mt-1 font-medium">
                Upload visual evidence with your description. MicroGov automatically identifies the issue and routes it directly to your responsible municipal department and local representative.
              </p>
            </div>

            {submissionSuccess && (
              <div className="mb-6 p-5 bg-cream border-2 border-lime/50 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold mb-1">
                  <CheckCircle2 className="w-5 h-5 text-lime" />
                  <span>Report Successfully Registered & Dispatched</span>
                </div>
                <p className="text-xs text-slate-700 mb-2 font-medium">
                  Assigned Authority: <strong>{submissionSuccess.local_authority || 'Local Ward Office'}</strong>
                </p>
                <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-vanilla leading-relaxed">
                  {submissionSuccess.routing_notes}
                </p>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="mt-3 text-xs bg-lime text-white font-black px-4 py-2 rounded-xl hover:opacity-90 transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>View on Community Feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-6">
              {/* Photo Upload Area */}
              <div>
                <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2">
                  1. Visual Evidence Photo
                </label>
                <div className="border-2 border-dashed border-vanilla hover:border-pink-grapefruit transition rounded-2xl p-6 text-center bg-cream/40 relative">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-56 mx-auto rounded-xl object-cover border-2 border-vanilla shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        className="text-xs text-raspberry font-bold hover:underline"
                      >
                        Remove & choose another photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-10 h-10 text-pink-grapefruit mx-auto mb-2" />
                      <p className="text-xs text-slate-800 font-bold mb-1">
                        Select or capture issue photo
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">Supports JPG, PNG, WEBP</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Voice Notes */}
              <div>
                <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2">
                  2. Voice Notes or Problem Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem, street address, hazard level (e.g. hazardous deep pothole near railway crossing)..."
                  className="w-full border border-vanilla rounded-2xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-raspberry bg-cream/30 text-slate-800 font-medium"
                  rows="3"
                />
              </div>

              {/* Civic Location & Dynamic Routing Preview */}
              <div className="bg-cream p-5 rounded-2xl border-2 border-vanilla space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-raspberry uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Target Civic Jurisdiction</span>
                  </span>
                  <span className="text-[10px] bg-vanilla text-raspberry font-extrabold px-2.5 py-0.5 rounded-full">
                    Auto-Identified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">City / Municipality</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Austin, Central City"
                      className="w-full border border-vanilla rounded-xl p-2.5 bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-raspberry"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Ward / Zone / Sector</label>
                    <input
                      type="text"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder="e.g. Ward 4, Downtown, North Sector"
                      className="w-full border border-vanilla rounded-xl p-2.5 bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-raspberry"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-vanilla flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Dynamic Dispatch Notification:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      This complaint will be analyzed by AI and routed directly to the designated department and field crew for{' '}
                      <strong>{ward || city || 'your local jurisdiction'}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-raspberry hover:bg-pink-grapefruit text-white font-extrabold py-4 rounded-2xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <span>{loading ? 'Submitting & Routing...' : 'Submit to Community Feed & Municipal Office'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: My Ward & Civic Representative */}
      {activeTab === 'ward' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-3xl border-2 border-vanilla shadow-xs">
            <h3 className="text-2xl font-black text-slate-900 mb-1.5">Registered Civic Profile</h3>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              Your filed reports are prioritized and resolved according to your registered municipal jurisdiction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-cream/70 rounded-2xl border border-vanilla">
                <span className="text-xs font-bold text-pink-grapefruit uppercase tracking-wider block mb-1">Citizen Name</span>
                <span className="font-black text-slate-900">{currentUser?.full_name || 'Active Citizen'}</span>
              </div>

              <div className="p-4 bg-cream/70 rounded-2xl border border-vanilla">
                <span className="text-xs font-bold text-pink-grapefruit uppercase tracking-wider block mb-1">Email Account</span>
                <span className="font-black text-slate-900">{currentUser?.email || 'citizen@microgov.org'}</span>
              </div>

              <div className="p-4 bg-cream/70 rounded-2xl border border-vanilla">
                <span className="text-xs font-bold text-pink-grapefruit uppercase tracking-wider block mb-1">Civic Ward & Zone</span>
                <span className="font-black text-raspberry">{currentUser?.ward || currentUser?.city || 'Civic Jurisdiction'}</span>
              </div>

              <div className="p-4 bg-cream/70 rounded-2xl border border-vanilla">
                <span className="text-xs font-bold text-pink-grapefruit uppercase tracking-wider block mb-1">Account Role</span>
                <span className="font-black text-slate-900">{currentUser?.role || 'CITIZEN'}</span>
              </div>
            </div>

            <div className="mt-6 p-6 bg-cream border-2 border-vanilla rounded-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-vanilla text-raspberry flex items-center justify-center font-bold shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-raspberry block mb-1">
                  Responsible Local Civic Center
                </span>
                <h4 className="text-lg font-black text-slate-900">
                  {currentUser?.representative || (currentUser?.ward ? `${currentUser.ward} Action Office` : 'Municipal Action Center')}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  Complaints filed in this jurisdiction automatically notify the local municipal office and the responsible field crew for fast assignment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}