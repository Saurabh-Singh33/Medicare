import React, { useState } from 'react'

const Login = () => {
    const [state, setState] = useState('Sign Up')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const onSubmitHandler = async (event) => {
        event.preventDefault()
    }

    return (
        <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
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
                    <input 
                        className='border border-zinc-300 rounded w-full p-2 mt-1 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary' 
                        type="password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        required 
                    />
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

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.4s ease-out forwards;
                }
                
                .animation-delay-100 {
                    animation-delay: 0.1s;
                }
                
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                
                .animation-delay-300 {
                    animation-delay: 0.3s;
                }
                
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                
                .animation-delay-500 {
                    animation-delay: 0.5s;
                }
            `}</style>
        </form>
    )
}

export default Login