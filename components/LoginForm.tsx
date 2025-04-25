'use client';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { getAccessToken, isTokenExpired } from '@/lib/auth/auth';
import { useGlobalContext } from '@/context/GlobalProvider';
import LoadingComponent from './LoadingComponent';
import { loginAction } from '@/lib/actions/login';
import {useForm} from "react-hook-form"
import {zodResolver} from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/schemas/login-shcema';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl")
  
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useActionState(loginAction, {success: false});

  const {register, handleSubmit, formState: {errors: clientErrors, isSubmitting}, setError} = useForm({resolver: zodResolver(loginSchema), mode: "onChange"})

  useEffect(() => {
    if(state.errors){
      Object.entries(state.errors).forEach(([field, messages]) => {
        setError(field as keyof typeof loginSchema.shape, {
          type: "server",
          message: messages?.join(', ')
        })
      })
    }
    if(state.success && state.redirectTo){
      if(callbackUrl){
        console.log("qitu")
        const callback = decodeURIComponent(callbackUrl)
        router.push(callback)
      }else{
        router.push(state.redirectTo)
      }
    }
  }, [state, setError, router])

  const onSubmit = handleSubmit((data, e) => {
    console.log(e?.target);
    
    const formData = new FormData(e?.target);
    startTransition(() => {
      formAction(formData);
    });
  })
  

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
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            {state?.message && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 text-red-600 p-3 rounded-lg text-sm"
              >
                {state?.message}
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
                    type="text"
                    autoComplete="username"
                    aria-invalid={!!clientErrors.username}
                    aria-describedby="username-error"
                    className={`block w-full text-gray-700 pl-10 pr-3 py-2 border ${
                      clientErrors.username ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Perdoruesi1"
                    {...register("username")}
                  />
                </div>
                {clientErrors.username && (
                  <p id="username-error" className="mt-1 text-sm text-red-600">
                    {clientErrors.username.message}
                  </p>
                )}
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
                    
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`block text-gray-700 w-full pl-10 pr-10 py-2 border ${
                      clientErrors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="••••••••"
                    aria-invalid={!!clientErrors.password}
                    aria-describedby='password-error'
                    {...register('password')}
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
                {clientErrors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600">
                    {clientErrors.password.message}
                  </p>
                )}
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
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
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