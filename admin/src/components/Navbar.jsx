import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import {useNavigate} from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {
  const {aToken,setAToken} = useContext(AdminContext)
  const {dToken,setDToken} = useContext(DoctorContext)

  const navigate = useNavigate()

  const logout =() =>{
     navigate('/')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
  }

  
  return (
    
    <div className='flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm'>
      <div className='flex items-center gap-3'>
        <img className='w-36 sm:w-40 cursor-pointer transition-transform duration-300 hover:scale-105' src={assets.admin_logo} alt="" />
        <p className='border px-3 py-1 rounded-full border-gray-300 bg-gray-50 text-gray-700 text-sm font-medium shadow-sm'>
          {aToken ? 'Admin' : 'Doctor'}
        </p>

      </div>
      <button 
        onClick={logout} 
        className='bg-gradient-to-r from-primary to-indigo-600 text-white text-sm px-8 py-2 rounded-full font-medium transition-all duration-300 hover:from-indigo-600 hover:to-primary hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer shadow-md'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar