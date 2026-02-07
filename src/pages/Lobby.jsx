import React, { useState, useEffect } from 'react'; // ✅ Added useEffect to imports
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRoom } from '../services/api';
import axios from 'axios';
import { Music, User, Crown, LogOut, Plus, Users, ChevronLeft } from 'lucide-react';

const Lobby = () => {
  const { user, logout } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const navigate = useNavigate();

  // ✅ MOVED INSIDE: useEffect must be inside the component
 useEffect(() => {
  const scriptId = 'razorpay-checkout-js';
  
  // Prevent duplicate scripts
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }

  return () => {
    // Only remove if the script is actually a child of the body to prevent the NotFoundError
    const script = document.getElementById(scriptId);
    if (script && script.parentNode === document.body) {
      document.body.removeChild(script);
    }
  };
}, []);
  // --- 1. SUBSCRIPTION LOGIC ---
  const handleUpgrade = async (planType) => {
    try {
      // 🚨 Ensure your .env has RAZORPAY_PLAN_MONTHLY and RAZORPAY_PLAN_YEARLY
      const { data: sub } = await axios.post('http://localhost:5000/api/payments/subscribe', { 
        planType, 
        userId: user._id 
      });

      const options = {
        key: "rzp_test_SB0waBu2xxRAuj", // REPLACE WITH YOUR RAZORPAY KEY ID
        subscription_id: sub.id, 
        name: "VibeSync Premier",
        description: `${planType.toUpperCase()} Subscription`,
        handler: async (response) => {
          const verifyData = {
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: user._id
          };
          await axios.post('http://localhost:5000/api/payments/verify-subscription', verifyData);
          alert("Success! You are now Premier.");
          window.location.reload();
        },
        theme: { color: "#9333ea" }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("UI Error:", err);
      alert("Payment failed to start. Check your backend terminal for the specific Razorpay error.");
    }
  };

  const handleCreate = async () => {
    try {
      const { data } = await createRoom();
      navigate(`/room/${data.roomCode}`);
    } catch (err) {
      alert("Failed to create room.");
    }
  };

  const handleJoin = () => {
    if (roomCode.trim()) navigate(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 p-2 rounded-lg"><Music size={24} /></div>
          <h1 className="text-2xl font-black tracking-tighter italic">VIBESYNC</h1>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowPlans(false); }}
            className="flex items-center gap-3 bg-zinc-900 border border-white/10 p-2 pr-5 rounded-full hover:bg-zinc-800 transition-all"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <User size={18} />
            </div>
            <span className="text-sm font-bold">{user?.name}</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-64 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
              <div className="border-b border-white/5 pb-4 mb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Account Status</p>
                
                {user?.membershipStatus === 'premier' ? (
                  <span className="text-yellow-500 flex items-center gap-1.5 text-sm font-black">
                    <Crown size={14} /> PREMIER MEMBER
                  </span>
                ) : !showPlans ? (
                  <button 
                    onClick={() => setShowPlans(true)}
                    className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    Upgrade to Premier
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button onClick={() => handleUpgrade('monthly')} className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-[11px] font-bold">
                      Monthly - ₹99/mo
                    </button>
                    <button onClick={() => handleUpgrade('yearly')} className="w-full bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 py-2 rounded-lg text-[11px] font-bold">
                      Yearly - ₹899/yr
                    </button>
                    <button onClick={() => setShowPlans(false)} className="w-full text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                      <ChevronLeft size={10} /> Back
                    </button>
                  </div>
                )}
              </div>
              <button onClick={logout} className="w-full flex items-center gap-3 px-2 py-1 text-sm text-red-400 font-medium">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="group bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden">
          <div className="bg-purple-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Plus className="text-purple-500" size={32} />
          </div>
          <h2 className="text-3xl font-black mb-3 italic text-white">Host Room</h2>
          <button onClick={handleCreate} className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
            Create Session
          </button>
        </div>

        <div className="group bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden">
          <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="text-blue-500" size={32} />
          </div>
          <h2 className="text-3xl font-black mb-3 italic text-white">Join Vibe</h2>
          <input 
            type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value)}
            placeholder="6-LETTER CODE" 
            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-center tracking-[0.3em] font-black text-xl uppercase mb-4 outline-none"
          />    
          <button onClick={handleJoin} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
            Enter Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;