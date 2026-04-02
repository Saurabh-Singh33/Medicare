import React from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-7xl m-5'>
      <p className='mb-3 text-xl font-medium'>All Appointments</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] py-3 px-6 border-b bg-gray-50'>
          <p className='text-gray-600 font-medium'>#</p>
          <p className='text-gray-600 font-medium'>Patient</p>
          <p className='text-gray-600 font-medium'>Payment</p>
          <p className='text-gray-600 font-medium'>Age</p>
          <p className='text-gray-600 font-medium'>Date & Time</p>
          <p className='text-gray-600 font-medium'>Fees</p>
          <p className='text-gray-600 font-medium'>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div key={index} className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] items-center py-3 px-6 border-b hover:bg-gray-50 transition-all duration-300'>
            <p className='max-sm:hidden text-gray-500'>{index + 1}</p>

            <div className='flex items-center gap-3'>
              <img className='w-10 h-10 rounded-full object-cover' src={item.userData.Image} alt="" />
              <p className='text-gray-700 font-medium'>{item.userData.name}</p>
            </div>

            <div>
              <p className={`text-sm inline border px-3 py-1 rounded-full ${item.payment ? 'border-green-500 text-green-500 bg-green-50' : 'border-yellow-500 text-yellow-500 bg-yellow-50'}`}>
                {item.payment ? 'Online' : 'Cash'}
              </p>
            </div>

            <p className='text-gray-500'>{calculateAge(item.userData.dob)}</p>

            <p className='text-gray-500'>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

            <p className='text-gray-700 font-semibold'>{currency} {item.amount}</p>

            <div className='flex items-center gap-3'>
              <img 
                className='w-7 h-7 cursor-pointer hover:scale-110 transition-transform duration-200' 
                src={assets.tick_icon} 
                alt="complete" 
              />
              <img 
                className='w-7 h-7 cursor-pointer hover:scale-110 transition-transform duration-200' 
                src={assets.cancel_icon} 
                alt="cancel" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorAppointments