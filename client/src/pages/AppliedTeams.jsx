import React from "react";

const AppliedTeams = () => {
  return (
    <div className="min-h-screen animated-gradient-bg pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">My Applications</h1>
          <p className="text-xl text-gray-300">Application status updates</p>
        </div>

        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-blue-400 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>

          <h3 className="text-2xl font-bold text-white mb-4">Check Your Email</h3>
          <p className="text-lg text-gray-300 mb-4">
            Please check the email address you provided during application for updates about your application status.
          </p>
          <p className="text-gray-300">
            Team creators will contact you directly if there is any update regarding your application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppliedTeams;
