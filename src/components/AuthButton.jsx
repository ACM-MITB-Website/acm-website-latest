// src/components/AuthButton.jsx (Final Styled Code)
import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { X, User, Mail, Calendar, LogOut, Shield, Phone, BookOpen, GraduationCap } from 'lucide-react';

function AuthButton({ className = "" }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogin = async () => {
    if (!auth || !auth.app) {
      alert("Authentication not configured. (Check .env keys)");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed:", error.message);
      alert("Login Failed: " + error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowProfileModal(false);
      setUserData(null);
    } catch (error) {
      console.error("Logout Failed:", error.message);
      alert("Logout Failed: " + error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch user data from Firebase
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData(data);
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error.message);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileModal && !e.target.closest('.profile-modal') && !e.target.closest('.profile-trigger')) {
        setShowProfileModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileModal]);

  if (loading) { return <div className="text-white text-sm">Checking status...</div>; }

  return (
    <div className="relative flex items-center justify-center">
      {user ? (
        <>
          {/* Profile Pill - Clickable */}
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="profile-trigger inline-flex items-center gap-3 bg-gray-800 px-5 py-2.5 rounded-full shadow-md md:border md:border-white/10 hover:bg-gray-700 hover:md:border-white/20 transition-all duration-200 min-w-fit"
          >
            <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-blue-400 flex-shrink-0" />
            <span className="text-white text-sm font-medium whitespace-nowrap leading-none">
              Hello, {user.displayName ? user.displayName.split(' ')[0] : 'User'}
            </span>
          </button>

          {/* Profile Modal */}
          {showProfileModal && (
            <div className="profile-modal fixed top-20 right-6 z-50 w-80 bg-gray-900 md:border md:border-white/20 rounded-2xl shadow-2xl overflow-y-auto max-h-[80vh] scrollbar-thin animate-[slideDown_0.2s_ease-out]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex flex-col items-center">
                  <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white/30 mb-3" />
                  <h3 className="text-white text-xl font-bold">{user.displayName || 'User'}</h3>
                  <p className="text-blue-100 text-sm">{user.email}</p>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 text-gray-300">
                  <User size={18} className="mt-1 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Full Name</p>
                    <p className="text-sm font-medium">{userData?.name || user.displayName || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-300">
                  <Mail size={18} className="mt-1 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="text-sm font-medium break-all">{user.email}</p>
                  </div>
                </div>

                {userData?.regNo && (
                  <div className="flex items-start gap-3 text-gray-300">
                    <BookOpen size={18} className="mt-1 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Registration No</p>
                      <p className="text-sm font-medium">{userData.regNo}</p>
                    </div>
                  </div>
                )}

                {userData?.department && (
                  <div className="flex items-start gap-3 text-gray-300">
                    <GraduationCap size={18} className="mt-1 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Department</p>
                      <p className="text-sm font-medium">{userData.department}</p>
                    </div>
                  </div>
                )}

                {userData?.year && (
                  <div className="flex items-start gap-3 text-gray-300">
                    <Calendar size={18} className="mt-1 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Year</p>
                      <p className="text-sm font-medium">{userData.year}</p>
                    </div>
                  </div>
                )}

                {userData?.phone && (
                  <div className="flex items-start gap-3 text-gray-300">
                    <Phone size={18} className="mt-1 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Phone</p>
                      <p className="text-sm font-medium">{userData.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-2">
                {userData?.townhall === true && (
                  <a
                    href="/townhall.html"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                  >
                    <Shield size={18} />
                    <span>Townhall Admin</span>
                  </a>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // IF LOGGED OUT (Final Styled Button)
        <button
          onClick={handleLogin}
          className={className || "px-4 py-2 bg-white text-black text-sm font-bold rounded-full shadow-lg hover:bg-acm-teal hover:scale-105 transition duration-200 whitespace-nowrap"}
        >
          LOGIN
        </button>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
export default AuthButton;
