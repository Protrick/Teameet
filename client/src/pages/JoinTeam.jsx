import React, { useContext, useEffect, useState } from 'react';
import { TeamContext } from '../context/TeamContext';
import { AppContext } from '../context/AppContext';

const JoinTeam = () => {
  const { availableTeams: teams, getAvailableTeams, applyToTeam, loading } = useContext(TeamContext);
  const { isLoggedin } = useContext(AppContext);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [applicationData, setApplicationData] = useState({
    linkedin: '',
    github: '',
    resume: ''
  });

  useEffect(() => {
    getAvailableTeams(filter);
  }, [filter]);

  const handleApply = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedTeam) return;

    // Require resume URL
    if (!applicationData.resume || applicationData.resume.trim() === '') {
      setMessage('Resume/Portfolio URL is required');
      return;
    }

    const payload = {
      teamId: selectedTeam._id,
      linkedin: applicationData.linkedin,
      github: applicationData.github,
      resume: applicationData.resume,
    };

    const result = await applyToTeam(payload);
    setMessage(result.message);

    if (result.success) {
      setShowModal(false);
      setApplicationData({ linkedin: '', github: '', resume: '' });
      setSelectedTeam(null);
      getAvailableTeams(filter);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
    setApplicationData({ linkedin: '', github: '', resume: '' });
  };

  if (!isLoggedin) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center pt-20">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p>You need to be logged in to join teams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient-bg pt-20 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Join a Team</h1>

        <div className="max-w-md mx-auto mb-8">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" className="text-black">All Domains</option>
            <option value="frontend" className="text-black">Frontend</option>
            <option value="backend" className="text-black">Backend</option>
            <option value="fullstack" className="text-black">Full Stack</option>
            <option value="mobile" className="text-black">Mobile</option>
            <option value="ai-ml" className="text-black">AI/ML</option>
            <option value="devops" className="text-black">DevOps</option>
            <option value="design" className="text-black">Design</option>
            <option value="other" className="text-black">Other</option>
          </select>
        </div>

        {message && (
          <div className={`max-w-2xl mx-auto mb-6 p-3 rounded ${message.includes('successfully') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center text-white">Loading teams...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {teams.map((team) => (
              <div key={team._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                <p className="text-blue-300 mb-2">Domain: {team.domain}</p>
                <p className="text-gray-300 mb-4">{team.description || 'No description provided'}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">
                    Members: {team.members?.length || 0}/{team.maxMembers}
                  </span>
                  <span className="text-gray-300">
                    Creator: {team.creator?.name}
                  </span>
                </div>
                <button
                  onClick={() => handleApply(team)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Apply to Join
                </button>
              </div>
            ))}
          </div>
        )}

        {teams.length === 0 && !loading && (
          <div className="text-center text-white">
            No teams available {filter && `in ${filter} domain`}.
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                Apply to {selectedTeam?.name}
              </h3>
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    LinkedIn Profile (optional)
                  </label>
                  <input
                    type="url"
                    value={applicationData.linkedin}
                    onChange={(e) => setApplicationData({ ...applicationData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    GitHub Profile (optional)
                  </label>
                  <input
                    type="url"
                    value={applicationData.github}
                    onChange={(e) => setApplicationData({ ...applicationData, github: e.target.value })}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Resume/Portfolio URL (required)
                  </label>
                  <input
                    type="url"
                    required
                    value={applicationData.resume}
                    onChange={(e) => setApplicationData({ ...applicationData, resume: e.target.value })}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTeam;