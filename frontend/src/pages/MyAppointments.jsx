import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])

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
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-paypal',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        if (!window.paypal) {
          const script = document.createElement('script')
          // Using frontend env variable for PayPal client ID
          script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}`
          script.onload = () => {
            renderPayPalButton(data.orderId, appointmentId)
          }
          document.body.appendChild(script)
        } else {
          renderPayPalButton(data.orderId, appointmentId)
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const renderPayPalButton = (orderId, appointmentId) => {
    let container = document.getElementById(`paypal-container-${appointmentId}`)
    if (!container) {
      const buttonContainer = document.createElement('div')
      buttonContainer.id = `paypal-container-${appointmentId}`
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
            const container = document.getElementById(`paypal-container-${appointmentId}`)
            if (container) container.innerHTML = ''
          } else {
            toast.error(captureData.message)
          }
        } catch (error) {
          console.log(error)
          toast.error('Payment failed')
        }
      },
      onError: (err) => {
        console.error('PayPal Error:', err)
        toast.error('Payment failed. Please try again.')
      }
    }).render(`#paypal-container-${appointmentId}`)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b"
            key={item._id || index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={item.docData?.image}
                alt=""
              />
            </div>

            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData?.name}
              </p>
              <p>{item.docData?.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address :</p>
              <p className="text-xs">{item.docData?.address?.line1}</p>
              <p className="text-xs">{item.docData?.address?.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time
                </span>{" "}
                {item.slotDate} | {item.slotTime}
              </p>
              {item.payment && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  ✓ Payment Completed
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && !item.payment && (
                <>
                  <button 
                    onClick={() => appointmentPaypal(item._id)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Pay with PayPal
                  </button>
                  <div id={`paypal-button-${item._id}`}></div>
                </>
              )}
              
              {!item.cancelled && !item.payment && (
                <button 
                  onClick={() => cancelAppointment(item._id)}   
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}
              
              {item.payment && (
                <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>
                  Payment Completed
                </button>
              )}
              
              {item.cancelled && (
                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                  Appointment cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments