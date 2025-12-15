import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (data.success) {
        // Server sets auth cookie on successful registration. Fetch profile to populate client state.
        await getUserData();
        setIsLoggedin(true);
        navigate('/');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center py-12 pt-20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded ${message.includes('success') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <span className="text-gray-300">Already have an account? </span>
            <Link to="/login" className="text-blue-300 hover:text-blue-200">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
