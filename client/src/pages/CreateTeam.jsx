import React, { useContext, useState } from 'react';
import { TeamContext } from '../context/TeamContext';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const CreateTeam = () => {
  const { createTeam } = useContext(TeamContext);
  const { isLoggedin } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', domain: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  if (!isLoggedin) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center pt-20">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p>You need to be logged in to create a team.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await createTeam(form);
    setLoading(false);
    if (res.success) {
      setMessage('Team created successfully');
      setTimeout(() => navigate('/created-teams'), 800);
    } else {
      setMessage(res.message || 'Create failed');
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg pt-20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Create a Team</h1>
        {message && <div className="mb-4 p-3 rounded bg-white/10 text-white">{message}</div>}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-white mb-2">Team Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full p-2 rounded bg-white/5 text-white" />
          </div>
          <div>
            <label className="block text-white mb-2">Domain</label>
            <input name="domain" value={form.domain} onChange={handleChange} required className="w-full p-2 rounded bg-white/5 text-white" />
          </div>
          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 rounded bg-white/5 text-white" />
          </div>
          <div className="text-right">
            <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{loading ? 'Creating...' : 'Create Team'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
