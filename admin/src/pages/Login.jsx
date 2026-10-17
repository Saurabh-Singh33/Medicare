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
          <div className="flex items-center justify-center gap-3 mb-4 select-none">
            <svg width="42" height="42" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.9997 0C35.7026 0 45.9997 10.2971 45.9997 23V39.1C45.9997 40.93 45.2728 42.685 43.9788 43.979C42.6848 45.273 40.9297 46 39.0997 46H24.1497V35.9099C24.1497 33.6076 24.29 31.2225 25.4975 29.2629C26.362 27.8586 27.5185 26.6566 28.8884 25.7385C30.2583 24.8204 31.8096 24.2077 33.4371 23.9419L33.8776 23.8706C34.0592 23.8085 34.2168 23.6912 34.3284 23.5351C34.44 23.379 34.5 23.1919 34.5 23C34.5 22.8081 34.44 22.621 34.3284 22.4649C34.2168 22.3088 34.0592 22.1915 33.8776 22.1294L33.4371 22.0581C31.0591 21.6697 28.8632 20.5441 27.1594 18.8403C25.4556 17.1365 24.3301 14.9406 23.9416 12.5626L23.8703 12.1222C23.8082 11.9406 23.6909 11.7829 23.5348 11.6713C23.3787 11.5597 23.1916 11.4997 22.9997 11.4997C22.8078 11.4997 22.6208 11.5597 22.4647 11.6713C22.3086 11.7829 22.1913 11.9406 22.1292 12.1222L22.0579 12.5626C21.7922 14.1902 21.1795 15.7415 20.2614 17.1114C19.3433 18.4814 18.1412 19.6378 16.7368 20.5022C14.7772 21.7097 12.3921 21.85 10.0898 21.85H0.0273438C0.628794 9.68185 10.6832 0 22.9997 0Z" fill="#5F6FFF"/>
              <path d="M0 24.15H10.0901C12.3924 24.15 14.7775 24.2903 16.7371 25.4978C18.2689 26.4417 19.5583 27.7311 20.5022 29.2629C21.7097 31.2225 21.85 33.6076 21.85 35.9099V46H6.9C5.07001 46 3.31496 45.273 2.02096 43.979C0.726962 42.685 0 40.93 0 39.1L0 24.15ZM46 2.3C46 2.91 45.7577 3.49501 45.3263 3.92635C44.895 4.35768 44.31 4.6 43.7 4.6C43.09 4.6 42.505 4.35768 42.0737 3.92635C41.6423 3.49501 41.4 2.91 41.4 2.3C41.4 1.69 41.6423 1.10499 42.0737 0.673654C42.505 0.242321 43.09 0 43.7 0C44.895 0.242321 45.3263 0.673654C45.7577 1.10499 46 1.69 46 2.3Z" fill="#5F6FFF"/>
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-bold tracking-tight text-gray-800 leading-tight">
                Medi<span className="text-primary">care</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-500 tracking-wider">
                Dashboard Panel
              </span>
            </div>
          </div>
          
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