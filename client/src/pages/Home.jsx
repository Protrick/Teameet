import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { userdata, isLoggedin } = useContext(AppContext);

  useEffect(() => {
    console.log('Home component mounted');
    console.log('Userdata:', userdata);
    console.log('IsLoggedin:', isLoggedin);
  }, [userdata, isLoggedin]);

  // Safe resolution for different userdata shapes
  const displayName = userdata?.name || userdata?.user?.name || userdata?.data?.name || "User";

  return (
    <div className="min-h-screen animated-gradient-bg pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            {isLoggedin ? `Welcome back, ${displayName}!` : "Welcome to TeamFinder"}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {isLoggedin
              ? "Ready to collaborate? Join teams or create your own to work on amazing projects."
              : "Connect with talented individuals and form teams for your next big project."
            }
          </p>
        </div>

        {isLoggedin ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link to="/create-team" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Team</h3>
              <p className="text-gray-300">Start a new project and find team members</p>
            </Link>

            <Link to="/join-team" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Join Team</h3>
              <p className="text-gray-300">Browse and join existing teams</p>
            </Link>

            <Link to="/created-teams" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">My Teams</h3>
              <p className="text-gray-300">Manage your created teams</p>
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
