import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState({})

  // USD to INR conversion rate (can be fetched from API in production)
  const USD_TO_INR = 85

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', {
        headers: { token }
      })

      if (data.success) {
        setAppointments(data.appointments.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment', 
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // PayPal Payment
  const appointmentPaypal = async (appointmentId) => {
    setLoadingPayments(prev => ({ ...prev, [appointmentId]: true }))
    
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-paypal',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        if (!window.paypal) {
          const script = document.createElement('script')
          script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=INR`
          script.onload = () => {
            renderPayPalButton(data.orderId, appointmentId)
          }
          script.onerror = () => {
            toast.error('Failed to load PayPal')
            setLoadingPayments(prev => ({ ...prev, [appointmentId]: false }))
          }
          document.body.appendChild(script)
        } else {
          renderPayPalButton(data.orderId, appointmentId)
        }
      } else {
        toast.error(data.message)
        setLoadingPayments(prev => ({ ...prev, [appointmentId]: false }))
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
      setLoadingPayments(prev => ({ ...prev, [appointmentId]: false }))
    }
  }

  const renderPayPalButton = (orderId, appointmentId) => {
    const containerId = `paypal-container-${appointmentId}`
    let container = document.getElementById(containerId)
    
    if (!container) {
      const buttonContainer = document.createElement('div')
      buttonContainer.id = containerId
      buttonContainer.className = 'mt-2'
      const buttonWrapper = document.querySelector(`#paypal-button-${appointmentId}`)
      if (buttonWrapper) {
        buttonWrapper.appendChild(buttonContainer)
      }
      container = buttonContainer
    }

    window.paypal.Buttons({
      createOrder: () => orderId,
      onApprove: async (data, actions) => {
        try {
          const { data: captureData } = await axios.post(
            backendUrl + '/api/user/capture-paypal-payment',
            { orderId: data.orderID, appointmentId },
            { headers: { token } }
          )
          
          if (captureData.success) {
            toast.success('Payment completed successfully!')
            getUserAppointments()
            const containerDiv = document.getElementById(containerId)
            if (containerDiv) containerDiv.innerHTML = ''
            setLoadingPayments(prev => ({ ...prev, [appointmentId]: false }))
          } else {
            toast.error(captureData.message)
            setLoadingPayments(prev => ({ ...prev, [appointmentId]: false }))
          }
        } catch (error) {
          console.log(error)
          toast.error('Payment failed')
          setLoadingPayments(prev => ({ ...prev, [appointmentId]: false }))
        }
      },
      onError: (err) => {
        console.error('PayPal Error:', err)
        toast.error('Payment failed. Please try again.')
        setLoadingPayments(prev => ({ ...prev, [appointmentId]: false }))
      }
    }).render(`#${containerId}`)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div className="max-w-6xl mx-auto px-4">
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      
      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="mt-4">
          {appointments.map((item, index) => {
            const amountINR = (item.amount * USD_TO_INR).toFixed(2)
            
            return (
              <div
                className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 sm:gap-6 py-4 border-b"
                key={item._id || index}
              >
                {/* Doctor Image */}
                <div className="flex justify-center sm:justify-start">
                  <img
                    className="w-28 h-28 object-cover rounded-lg bg-indigo-50"
                    src={item.docData?.image}
                    alt=""
                  />
                </div>

                {/* Doctor Details */}
                <div className="flex-1 text-sm text-zinc-600">
                  <p className="text-neutral-800 font-semibold text-base">
                    {item.docData?.name}
                  </p>
                  <p className="text-zinc-500">{item.docData?.speciality}</p>
                  
                  <p className="text-zinc-700 font-medium mt-2">Address:</p>
                  <p className="text-xs text-zinc-500">
                    {item.docData?.address?.line1 || 'Address not available'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {item.docData?.address?.line2 || ''}
                  </p>
                  
                  <p className="text-xs mt-2">
                    <span className="text-sm text-neutral-700 font-medium">
                      Date & Time:
                    </span>{' '}
                    {item.slotDate} | {item.slotTime}
                  </p>
                  
                  <p className="text-xs mt-1">
                    <span className="text-sm text-neutral-700 font-medium">
                      Fees:
                    </span>{' '}
                    <span className="font-medium">${item.amount} USD</span>
                    <span className="text-gray-500 ml-1">
                      (≈ ₹{amountINR})
                    </span>
                  </p>
                  
                  {item.payment && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ✓ Payment Completed
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 justify-end">
                  {!item.cancelled && !item.payment && (
                    <>
                      <button 
                        onClick={() => appointmentPaypal(item._id)}
                        disabled={loadingPayments[item._id]}
                        className={`text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded transition-all duration-300 ${
                          loadingPayments[item._id]
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-primary hover:text-white hover:border-primary'
                        }`}
                      >
                        {loadingPayments[item._id] ? 'Processing...' : 'Pay with PayPal'}
                      </button>
                      <div id={`paypal-button-${item._id}`}></div>
                    </>
                  )}
                  
                  {!item.cancelled && !item.payment && (
                    <button 
                      onClick={() => cancelAppointment(item._id)}   
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                    >
                      Cancel appointment
                    </button>
                  )}
                  
                  {item.payment && (
                    <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500 bg-green-50 cursor-default">
                      ✓ Payment Completed
                    </button>
                  )}
                  
                  {item.cancelled && (
                    <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500 bg-red-50 cursor-default">
                      ✗ Appointment cancelled
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyAppointments