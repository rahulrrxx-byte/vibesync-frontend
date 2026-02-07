import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Music, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '', name: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure name is present for Signup
    if (!isLogin && !formData.name) {
        alert("Please enter your name");
        return;
    }

    const action = isLogin ? '/login' : '/signup';
    
    try {
      const targetURL = `http://localhost:5000/api/auth${action}`;
      // Log exactly what you are sending to the server
      console.log("Payload:", formData);

      const { data } = await axios.post(targetURL, formData);
      
      login(data.user, data.token); 
      navigate('/', { replace: true }); 
    } catch (err) {
      // This will now show you EXACTLY why the backend said no
      const errorMsg = err.response?.data?.message || "Auth Failed";
      console.error("Backend Error Details:", err.response?.data);
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 p-4 rounded-2xl shadow-lg shadow-purple-500/20">
            <Music size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Join the Vibe'}
        </h2>
        <p className="text-zinc-500 text-center mb-8">
          {isLogin ? 'Login to host or join rooms' : 'Create an account to get started'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-black border border-white/5 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          )}
          
          <div className="relative">
            <input
              type="text"
              placeholder="Email or Mobile"
              className="w-full bg-black border border-white/5 rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              required
            />
            <Mail className="absolute left-4 top-4 text-zinc-600" size={20} />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-black border border-white/5 rounded-xl p-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <Lock className="absolute left-4 top-4 text-zinc-600" size={20} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-zinc-600 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-zinc-500 text-sm mt-6 hover:text-white transition-colors"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;