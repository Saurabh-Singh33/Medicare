import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import axios from 'axios'
import { toast } from "react-toastify";

const Login = () => {

  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { setAToken, backendUrl } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
          toast.success(data.message)
        } else {
          toast.error(data.message)
        }
      }
      else {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })

        if (data.success) {
          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
          toast.success(data.message)
          console.log(data.token)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-purple-100 to-violet-200'>
      
      <div className='bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-6 w-full max-w-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]'>
        
        <div className='text-center mb-6'>
          <img src={assets.admin_logo} alt="Logo" className='h-12 mx-auto mb-3 transition-transform duration-300 hover:scale-110' />
          
          <p className='text-2xl font-semibold text-gray-800'>
            <span className={state === 'Admin' ? 'text-violet-600' : 'text-emerald-500'}>
              {state}
            </span> Login
          </p>
          
          <p className='text-xs text-gray-500 mt-1'>
            Access your dashboard
          </p>
        </div>

        <div className='space-y-4'>
          
          <div className='group'>
            <p className='text-xs font-medium text-gray-600 mb-1 transition-all duration-300 group-focus-within:text-violet-600'>
              Email
            </p>
            <input onChange={(e) => setEmail(e.target.value)} value={email}
              type="email" 
              required 
              className='w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-white/70 transition-all duration-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-400/20 hover:border-violet-400'
              placeholder="admin@example.com"
            />
          </div>
          
          <div className='group'>
            <p className='text-xs font-medium text-gray-600 mb-1 transition-all duration-300 group-focus-within:text-violet-600'>
              Password
            </p>
            <input onChange={(e) => setPassword(e.target.value)} value={password}
              type="password" 
              required 
              className='w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-white/70 transition-all duration-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-400/20 hover:border-violet-400'
              placeholder="••••••••"
            />
          </div>

        </div>

        <button 
          type="submit"
          className='w-full bg-gradient-to-r from-violet-600 to-purple-500 text-white py-2.5 text-sm rounded-md font-medium mt-5 transition-all duration-300 hover:from-violet-700 hover:to-purple-600 hover:scale-[1.02] active:scale-[0.97] cursor-pointer shadow-md hover:shadow-lg'
        >
          Login
        </button>

        <div className='text-center mt-5 text-xs text-gray-600'>
          {state === 'Admin'
            ? <p>
                Doctor Login?{" "}
                <span 
                  onClick={() => setState('Doctor')} 
                  className="text-emerald-500 font-medium cursor-pointer transition-all duration-300 hover:text-emerald-600 hover:underline"
                >
                  Click here
                </span>
              </p>
            : <p>
                Admin Login?{" "}
                <span 
                  onClick={() => setState('Admin')} 
                  className="text-violet-600 font-medium cursor-pointer transition-all duration-300 hover:text-violet-700 hover:underline"
                >
                  Click here
                </span>
              </p>
          }
        </div>

      </div>
    </form>
  );
};

export default Login;