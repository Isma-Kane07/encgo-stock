import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Package, LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Connexion réussie');
      if (res.data.user.role === 'responsable') navigate('/responsable');
      else navigate('/fonctionnaire');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-encgo-red to-encgo-red-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-encgo-red rounded-full shadow-lg mb-4">
            <Package size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-encgo-red">ENCGO</h1>
          <p className="text-encgo-gray-dark">Gestion de stock</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-encgo-gray-dark mb-1 text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-encgo-red focus:border-transparent transition"
                placeholder="exemple@encgo.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-encgo-gray-dark mb-1 text-sm font-medium">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-encgo-red focus:border-transparent transition"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-encgo-red hover:bg-encgo-red-dark text-white font-semibold py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> Se connecter
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 border-t pt-4">
          <p>R : admin@encgo.ma / admin123</p>
          <p>F : user@encgo.ma / user123</p>
        </div>
      </div>

      {/* Copyright en bas de page */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-xs">
        © ENCGO {new Date().getFullYear()} - Tous droits réservés.
      </div>
    </div>
  );
}
