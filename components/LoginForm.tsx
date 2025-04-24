'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { getAccessToken, isTokenExpired, login } from '@/lib/auth/auth';
import { redirect, useRouter } from 'next/navigation';
import { useGlobalContext } from '@/context/GlobalProvider';
import LoadingComponent from './LoadingComponent';

const LoginForm = () => {
const {isLoggedIn, isLoading: loginLoading} = useGlobalContext();
const router = useRouter();
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
const [checkingAuth, setCheckingAuth] = useState(true)


useEffect(() => {
  if(isLoggedIn){
    router.replace("/room")
  }else{
    setCheckingAuth(false);
  }
}, [isLoggedIn, router])

  if(loginLoading || checkingAuth) return <LoadingComponent />
  if(isLoggedIn) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await login(username, password);
      if(response.message === "Login incorrect!"){
          setError("Te dhena te gabuara. Ju lutem provoni perseri");
      }else if(response.token){
        router.replace("/room")
      }
    } catch (err) {
      setError('Dicka shkoi gabim. Ju lutem provoni perseri');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Mire se erdhe</h1>
            <p className="text-blue-100 mt-1">Kycuni ne llogarine tuaj</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 text-red-600 p-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {/* username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Perdoruesi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="text"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full text-gray-700 pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Perdoruesi1"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Fjalekalimi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block text-gray-700 w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Keni harruar fjalekalimin?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Duke u kycur...
                  </span>
                ) : (
                  'Kycuni'
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
              Nuk keni llogari?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Regjistrohuni nga <span className="text-mob-secondary font-semibold">Aplikacioni</span>
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;