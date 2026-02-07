import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Crown } from 'lucide-react';

const PremierButton = () => {
  const { user, token } = useAuth();

  const handlePayment = async () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: 49900, // ₹499.00
      currency: "INR",
      name: "VibeSync Premier",
      description: "Get 3x Voting Power & AI Playlists",
      handler: function (response) {
        alert("Payment Successful! Your account is being upgraded.");
        // Here you would call your backend to save the transaction
      },
      prefill: {
        email: user?.email || "guest@example.com",
      },
      theme: { color: "#9333ea" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button 
      onClick={handlePayment}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
    >
      <Crown size={18} />
      Upgrade to Premier
    </button>
  );
};

export default PremierButton;