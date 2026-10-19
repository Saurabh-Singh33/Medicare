import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'


const Login = () => {

   const {backendUrl , token ,setToken} = useContext(AppContext)
   const navigate = useNavigate()

    const [state, setState] = useState('Sign Up')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            const cleanEmail = email.trim()
            if (state === 'Sign Up') {
                const {data} = await axios.post(backendUrl + '/api/user/register',{name: name.trim(),password,email: cleanEmail})

                if (data.success) {
                   localStorage.setItem('token',data.token)
                   setToken(data.token)
                }else{
                    toast.error(data.message)
                }
            }else{
                 const {data} = await axios.post(backendUrl + '/api/user/login',{password,email: cleanEmail})

                if (data.success) {
                   localStorage.setItem('token',data.token)
                   setToken(data.token)
                }else{
                    toast.error(data.message)
                }
            }
        } catch (error) {
             toast.error(error.message)
        }
    }

     useEffect(()=>{
  if (token) {
     navigate('/')
  }
     },[token])

      return (
        <form   onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>

            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-lg shadow-lg bg-white hover:shadow-2xl transition-all duration-500'>
                <p className='text-2xl font-semibold animate-fadeIn'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
                <p className='text-sm text-gray-500 animate-fadeIn animation-delay-100'>Please {state === 'Sign Up' ? "sign up" : "login in"} to book appointment</p>
                
                {state === 'Sign Up' && (
                    <div className='w-full animate-slideDown'>
                        <p className='font-medium'>Full Name</p>
                        <input 
                            className='border border-zinc-300 rounded w-full p-2 mt-1 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary' 
                            type="text" 
                            onChange={(e) => setName(e.target.value)} 
                            value={name} 
                            required 
                        />
                    </div>
                )}

                <div className='w-full animate-fadeIn animation-delay-200'>
                    <p className='font-medium'>Email</p>
                    <input 
                        className='border border-zinc-300 rounded w-full p-2 mt-1 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary' 
                        type="email" 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        required 
                    />
                </div>

                <div className='w-full animate-fadeIn animation-delay-300'>
                    <p className='font-medium'>Password</p>
                    <div className='relative w-full mt-1'>
                        <input 
                            className='border border-zinc-300 rounded w-full p-2 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary' 
                            type={showPassword ? "text" : "password"} 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password} 
                            required 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 focus:outline-none cursor-pointer p-1 rounded transition-colors flex items-center justify-center'
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className='w-4 h-4 text-zinc-500 hover:text-primary transition-colors' />
                            ) : (
                                <Eye className='w-4 h-4 text-zinc-500 hover:text-primary transition-colors' />
                            )}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit"
                    className='bg-primary text-white w-full py-2 rounded-md text-base hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer animate-fadeIn animation-delay-400'
                >
                    {state === 'Sign Up' ? "Create Account" : "Login"}
                </button>

                <div className='w-full text-center animate-fadeIn animation-delay-500'>
                    {state === 'Sign Up' 
                        ? <p className='transition-all duration-300'>Already have an account? <span onClick={() => setState('Login')} className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors duration-300">Login here</span></p>
                        : <p className='transition-all duration-300'>Create a new account? <span onClick={() => setState('Sign Up')} className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors duration-300">click here</span></p>
                    }
                </div>
            </div>
        </form>
    )
}

export default Login