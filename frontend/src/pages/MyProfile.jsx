import React, { useState } from 'react'
import { assets } from '../assets/assets'

const MyProfile = () => {

  const [userData, setUserData] = useState({
    name: "Edward Vincent",
    image: assets.profile_pic,
    email: 'richardjameswap@gmail.com',
    phone: '+1 123 456 7890',
    address: {
      line1: "57th Cross, Richmond ",
      line2: "Circle, Church Road, London"
    },
    gender: 'Male',
    dob: '2000-01-20'
  })

  const [isEdit, setIsEdit] = useState(false)

  return (
    <div className='max-w-4xl mx-auto my-10 p-8 bg-white rounded-xl shadow-lg'>
      {/* Profile Header */}
      <div className='flex items-center gap-6 mb-8'>
        <img src={userData.image} alt="Profile" className='w-24 h-24 rounded-full object-cover border-4 border-primary shadow-md' />
        <div className='flex-1'>
          {isEdit 
            ? <input 
                type='text' 
                value={userData.name}  
                onChange={e=>setUserData(prev=>({...prev, name: e.target.value}))}
                className='text-3xl font-semibold border-b-2 border-primary focus:outline-none w-full py-1'
              />
            : <p className='text-3xl font-semibold text-gray-800'>{userData.name}</p>
          }
        </div>
      </div>
      
      <hr className='border-t-2 border-gray-200 my-6' />
      
      {/* Contact Information Section */}
      <div className='mb-8'>
        <p className='text-xl font-semibold text-gray-700 mb-4'>CONTACT INFORMATION</p>
        <div className='space-y-4'>
          {/* Email */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
            <p className='font-medium text-gray-600'>Email id:</p>
            <p className='md:col-span-2 text-gray-800'>{userData.email}</p>
          </div>
          
          {/* Phone */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2 items-center'>
            <p className='font-medium text-gray-600'>Phone :</p>
            <div className='md:col-span-2'>
              {isEdit 
                ? <input 
                    type='text' 
                    value={userData.phone}  
                    onChange={e=>setUserData(prev=>({...prev, phone: e.target.value}))}
                    className='border border-gray-300 rounded-lg px-3 py-2 w-full focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300'
                  />
                : <p className='text-gray-800'>{userData.phone}</p>
              }
            </div>
          </div>
          
          {/* Address */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
            <p className='font-medium text-gray-600'>Address :</p>
            <div className='md:col-span-2'>
              {isEdit
                ? <div className='space-y-2'>
                    <input 
                      onChange={(e)=>setUserData(prev=>({...prev, address: {...prev.address, line1: e.target.value}}))}  
                      value={userData.address.line1} 
                      type="text" 
                      className='border border-gray-300 rounded-lg px-3 py-2 w-full focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300'
                      placeholder="Address line 1"
                    />
                    <input 
                      type="text"
                      onChange={(e)=>setUserData(prev=>({...prev, address: {...prev.address, line2: e.target.value}}))}  
                      value={userData.address.line2} 
                      className='border border-gray-300 rounded-lg px-3 py-2 w-full focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300'
                      placeholder="Address line 2"
                    />
                  </div>
                : <p className='text-gray-800'>
                    {userData.address.line1}
                    <br />
                    {userData.address.line2}
                  </p>
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Basic Information Section */}
      <div className='mb-8'>
        <p className='text-xl font-semibold text-gray-700 mb-4'>BASIC INFORMATION</p>
        <div className='space-y-4'>
          {/* Gender */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2 items-center'>
            <p className='font-medium text-gray-600'>Gender :</p>
            <div className='md:col-span-2'>
              {isEdit 
                ? <select 
                    onChange={(e)=> setUserData(prev=> ({...prev, gender: e.target.value}))} 
                    value={userData.gender}
                    className='border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 bg-white'
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                : <p className='text-gray-800'>{userData.gender}</p>
              }
            </div>
          </div>

          {/* Birthday */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2 items-center'>
            <p className='font-medium text-gray-600'>Birthday:</p>
            <div className='md:col-span-2'>
              {isEdit 
                ? <input 
                    type="date" 
                    onChange={(e)=> setUserData(prev=> ({...prev, dob: e.target.value}))} 
                    value={userData.dob}
                    className='border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300'
                  />
                : <p className='text-gray-800'>{userData.dob}</p>
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className='flex justify-end'>
        {isEdit 
          ? <button 
              onClick={()=>setIsEdit(false)}
              className='bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer'
            >
              Save information
            </button>
          : <button 
              onClick={()=>setIsEdit(true)}
              className='bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 hover:scale-105 hover:shadow-md active:scale-95 transition-all duration-300 cursor-pointer border border-gray-300'
            >
              Edit
            </button>
        }
      </div>
    </div>
  )
}

export default MyProfile