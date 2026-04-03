import React from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

  const { dToken, getDashData, dashData, setDashData, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  if (!dashData) {
    return <div className="m-5 text-gray-500 animate-pulse">Loading dashboard...</div>
  }

  // Handle complete appointment
  const handleComplete = async (appointmentId) => {
    await completeAppointment(appointmentId)
    getDashData() // Refresh dashboard data
  }

  // Handle cancel appointment
  const handleCancel = async (appointmentId) => {
    await cancelAppointment(appointmentId)
    getDashData() // Refresh dashboard data
  }

  return (
    <div className="m-5">
      <p className="text-2xl font-semibold text-gray-800 mb-6">Doctor Dashboard</p>
      
      {/* Stats Cards */}
      <div className="flex flex-wrap gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md min-w-44 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3">
            <img className="w-10" src={assets.earnings_icon} alt="" />
            <div>
              <p className="text-2xl font-bold text-primary">{currency}{dashData.earnings}</p>
              <p className="text-gray-500 text-sm">Earnings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-md min-w-44 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3">
            <img className="w-10" src={assets.appointments_icon} alt="" />
            <div>
              <p className="text-2xl font-bold text-primary">{dashData.appointments}</p>
              <p className="text-gray-500 text-sm">Appointments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-md min-w-44 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3">
            <img className="w-10" src={assets.patients_icon} alt="" />
            <div>
              <p className="text-2xl font-bold text-primary">{dashData.patients}</p>
              <p className="text-gray-500 text-sm">Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Appointments Section */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b">
          <img className="w-5" src={assets.list_icon} alt="" />
          <p className="font-semibold text-gray-700">Latest Appointments</p>
        </div>

        <div>
          {dashData.latestAppointments?.map((item, index) => (
            <div key={index} className="flex items-center justify-between px-6 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full object-cover" src={item.userData?.Image} alt="" />
                <div>
                  <p className="text-gray-800 font-medium">{item.userData?.name}</p>
                  <p className="text-gray-500 text-sm">{slotDateFormat(item.slotDate)} | {item.slotTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!item.cancelled && !item.isCompleted && (
                  <>
                    <button
                      onClick={() => handleComplete(item._id)}
                      className="text-green-500 text-xs font-medium bg-green-50 px-3 py-1 rounded-full hover:bg-green-100 hover:scale-105 transition-all duration-200 cursor-pointer"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleCancel(item._id)}
                      className="text-red-500 text-xs font-medium bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 hover:scale-105 transition-all duration-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {item.cancelled && (
                  <span className="text-red-500 text-xs font-medium bg-red-50 px-3 py-1 rounded-full">Cancelled</span>
                )}
                {!item.cancelled && item.isCompleted && (
                  <span className="text-green-500 text-xs font-medium bg-green-50 px-3 py-1 rounded-full">Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard