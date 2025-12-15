import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/sendResetOtp`, { email });
      setMessage(data.message || 'Reset instructions sent to your email');
      if (data.success) {
        toast.success(data.message || 'OTP sent to email');
        setStep(2);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/resetPassword`, { email, otp, newPassword });
      if (data.success) {
        toast.success(data.message || 'Password reset successful');
        navigate('/login');
      } else {
        toast.error(data.message || 'Reset failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center py-12 pt-20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Reset Password
          </h2>

          {step === 1 ? (
            <form onSubmit={requestOtp} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitReset} className="flex flex-col gap-4">
              <h2 className="text-xl">Reset password</h2>
              <input
                type="text"
                placeholder="OTP"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="p-2 rounded outline-2"
              />
              <input
                type="password"
                placeholder="New password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 rounded outline-2"
              />
              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-green-700"
                  type="submit"
                >
                  Reset Password
                </button>
                <button
                  className="bg-gray-500 cursor-pointer hover:bg-gray-700 text-white py-2 px-4 rounded"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {message && (
            <div
              className={`mt-4 p-3 rounded ${message.includes('sent')
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
                }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-300 hover:text-blue-200">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
