import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import ForgotPasswordModel from './ForgotPasswordModel'
import copy from 'copy-to-clipboard'

const LoginModel = ({ setStep }) => {
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const navigate = useNavigate()

  const location = useLocation()

  axios.defaults.withCredentials = true

  const login = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email, password }, { withCredentials: true })

      console.log('data', data);


      if (data.success) {
        setIsLoggedIn(true)
        await getUserData()

        if (data?.company === '' && data?.role === 'recruiter') {
          setStep(2)
          toast.info('Please add your company details')
        } else {
          await navigate('/dashboard')
          toast.success(data.message)
        }
      } else {
        toast.error(data.message)
        setIsLoggedIn(false)
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  if (showForgotPassword) {
    return <ForgotPasswordModel onBackToLogin={() => setShowForgotPassword(false)} />
  }

  return (
    <div className="flex flex-col w-full justify-center items-center">
      <div className={`w-full ${location.pathname === '/login' && "px-8 md:px-32 lg:px-24"}`}>
        <form onSubmit={login} className="bg-white rounded-2xl border border-gray-300 p-10 flex flex-col gap-3">
          {
            location.pathname === "/login" &&
            <div className="w-full max-w-md mx-auto mb-6">
              <div className="bg-gray-100 rounded-xl p-4 text-gray-700 shadow-sm text-sm">
                <div className="mb-1">
                  Email: <span onClick={() => {toast.success("Copied to Clipboard"); copy('test@employer.com')}} className="font-semibold text-green-700 cursor-pointer">test@employer.com</span>
                  <span className="text-gray-500"> or </span>
                  <span onClick={() => {toast.success("Copied to Clipboard"); copy('test@jobseeker.com')}} className="font-semibold text-green-700 cursor-pointer">test@jobseeker.com</span>
                </div>

                <p>
                  Password: <span onClick={() => {toast.success("Copied to Clipboard");  copy('Alfa_Careers')}} className="font-semibold text-green-700 cursor-pointer">Alfa_Careers</span>
                </p>
              </div>
            </div>
          }
          <h1 className="text-gray-800 font-bold text-2xl mb-1">Login</h1>
          <p className="text-sm font-normal text-gray-600 mb-6">Welcome back 👋</p>

          {/* Email Input */}
          <div className="flex items-center border-2 py-2 px-3 rounded-2xl">
            <Mail size={18} className="text-gray-400" />
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email Address"
              className="pl-2 py-1 text-sm w-full outline-none border-none text-[var(--primary-color)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center border-2 py-2 px-3 rounded-2xl relative">
            <Lock size={18} className="text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className="text-[var(--primary-color)] pl-2 py-1 text-sm pr-8 w-full outline-none border-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginLoading}
            className="primary-btn"
          >
            {loginLoading ? 'Loading...' : 'Login'}
          </button>

          {/* Footer Links */}
          <div className="flex justify-between mt-4 text-sm">
            <span
              onClick={() => setShowForgotPassword(true)}
              className="text-gray-500 hover:text-[var(--primary-color)] cursor-pointer transition-colors font-medium"
            >
              Forgot Password?
            </span>
            <Link
              to="/register"
              className="text-gray-500 hover:text-[var(--primary-color)] cursor-pointer transition-colors font-medium"
            >
              Don't have an account yet?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModel
