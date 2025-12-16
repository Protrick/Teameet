import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedin, setIsLoggedin, logout } = useContext(AppContext);

  return (
    <>
      <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="fixed top-0 left-0 w-full z-50 h-16 py-0 flex justify-between items-center bg-white/10 text-white px-12 backdrop-blur-md">
        <div className="flex items-center gap-3 p-0">
          <Link to="/" className="flex items-center gap-3 p-0">
            <img src="../Teameet(logo).png" alt="Teameet logo" title="Teameet" className="h-15 w-auto object-contain flex-shrink-0" />
            <span className="text-2xl font-semibold text-amber-400 hidden sm:inline hover:text-yellow-300 transition-colors">Teameet</span>
          </Link>
        </div>
        <ul className="flex justify-center items-center gap-4">
          {[
            ["/", "Home"],
            ["/join-team", "Join Team"],
            ["/create-team", "Create Team"],
            ["/created-teams", "My Teams"],
            ["/applied-teams", "My Applications"],
          ].map(([to, label]) => (
            <li key={label}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `inline-block px-3 py-2 rounded ${isActive ? 'text-amber-400' : 'text-white'} hover:text-amber-400`}
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={async () => { if (isLoggedin) { await logout(); navigate('/login'); } else { navigate('/login'); } }}
              className={isLoggedin ? "bg-red-500 text-white px-4 py-2 rounded hover:text-amber-400 active:text-amber-400" : "bg-blue-700 text-white px-4 py-2 rounded hover:text-amber-400 active:text-amber-400"}>{isLoggedin ? "Logout" : "Login"}
            </button>
          </li>
        </ul>
      </motion.div>
    </>
  );
};

export default Navbar;
