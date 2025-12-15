import React, { useContext, useEffect, useState } from 'react';
import { TeamContext } from '../context/TeamContext';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const CreatedTeams = () => {
    const { createdTeams, myTeams, getMyTeams, acceptApplicant, rejectApplicant, toggleRecruiting, loading } = useContext(TeamContext);
    const { isLoggedin, userdata } = useContext(AppContext);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedin) {
            getMyTeams();
        }
    }, [isLoggedin]);

    const handleAccept = async (teamId, applicantId) => {
        const result = await acceptApplicant(teamId, applicantId);
        const msg = result?.message || (result?.success ? 'Applicant accepted' : 'Action failed');
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
        return result;
    };

    const handleReject = async (teamId, applicantId) => {
        const result = await rejectApplicant(teamId, applicantId);
        const msg = result?.message || (result?.success ? 'Applicant rejected' : 'Action failed');
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
        return result;
    };

    if (!isLoggedin) {
        return (
            <div className="min-h-screen animated-gradient-bg flex items-center justify-center pt-20">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Please Login</h2>
                    <p>You need to be logged in to view your teams.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen animated-gradient-bg pt-20 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-white text-center mb-8">My Teams</h1>

                {message && (
                    <div className={`max-w-2xl mx-auto mb-6 p-3 rounded ${message.includes('successfully') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="text-center text-white">Loading teams...</div>
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {(myTeams || []).map((team) => {
                            const isCreator = (createdTeams || []).some((t) => String(t._id) === String(team._id));
                            return (
                                <div key={team._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-bold text-white mb-2">{team.name}</h3>
                                        <p className="text-blue-300 mb-2">Domain: {team.domain}</p>
                                        <p className="text-gray-300 mb-2">{team.description || 'No description provided'}</p>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Members: {team.members?.length || 0}/{team.maxMembers}</span>
                                            <div className="flex items-center gap-3">
                                                <span>Status: {team.isOpen ? 'Open' : 'Closed'}</span>
                                                {isCreator && ((team.members?.length || 0) < (team.maxMembers || 2)) && (
                                                    <button
                                                        onClick={async () => {
                                                            const res = await toggleRecruiting(team._id, !team.isOpen);
                                                            setMessage(res.message || (res.success ? 'Updated' : 'Failed'));
                                                            setTimeout(() => setMessage(''), 3000);
                                                        }}
                                                        className="ml-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
                                                    >
                                                        {team.isOpen ? 'Stop Recruiting' : 'Recruit'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {team.members && team.members.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-white mb-3">Current Members</h4>
                                            <div className="space-y-2">
                                                {team.members.map((member) => (
                                                    <div key={member._id} className="bg-white/5 rounded-lg p-3">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="text-white font-medium">{member.name}</p>
                                                                <p className="text-gray-300 text-sm">{member.email}</p>
                                                            </div>
                                                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm">
                                                                Member
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {team.applicants && team.applicants.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-white mb-3">Pending Applications</h4>
                                            <div className="space-y-3">
                                                {team.applicants.map((applicant) => (
                                                    <div key={applicant._id} className="bg-white/5 rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <p className="text-white font-medium">{applicant.user?.name}</p>
                                                                <p className="text-gray-300 text-sm mb-2">{applicant.user?.email}</p>

                                                                <div className="text-sm text-gray-300 space-y-1">
                                                                    {applicant.linkedin && (
                                                                        <p>LinkedIn: <a href={applicant.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">View Profile</a></p>
                                                                    )}
                                                                    {applicant.github && (
                                                                        <p>GitHub: <a href={applicant.github} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">View Profile</a></p>
                                                                    )}
                                                                    {applicant.resume && (
                                                                        <p>Resume: <a href={applicant.resume} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">View Resume</a></p>
                                                                    )}
                                                                    <p>Applied: {new Date(applicant.appliedAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>

                                                            {/* Only show accept/reject if current user is the creator */}
                                                            {isCreator && (
                                                                <div className="flex space-x-2 ml-4">
                                                                    <button
                                                                        onClick={async () => { await handleAccept(team._id, applicant.user._id); }}
                                                                        disabled={loading || (team.members?.length || 0) >= team.maxMembers}
                                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => { await handleReject(team._id, applicant.user._id); }}
                                                                        disabled={loading}
                                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(!team.applicants || team.applicants.length === 0) && (!team.members || team.members.length === 0) && (
                                        <p className="text-gray-300 text-center py-4">No applicants yet</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {(!myTeams || myTeams.length === 0) && !loading && (
                    <div className="text-center text-white">
                        <p className="mb-4">You don't have any teams yet (created or member of).</p>
                        <a href="/create-team" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors inline-block">
                            Create Your First Team
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatedTeams;
