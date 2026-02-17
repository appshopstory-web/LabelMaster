import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess?: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    // Simular autenticação simples
    setTimeout(() => {
      localStorage.setItem('user_email', email);
      onLoginSuccess?.(email);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          
          {/* Logo */}
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-black text-white">LP</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">LabelMaster Pro</h1>
            <p className="text-xs text-slate-500 mt-1">Criador de Etiquetas</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Digite qualquer email para continuar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
