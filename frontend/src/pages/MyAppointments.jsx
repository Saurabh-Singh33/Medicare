import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, userData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [payingId, setPayingId] = useState(null)

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', {
        headers: { token }
      })

      if (data.success) {
        const sorted = [...data.appointments].sort((a, b) => {
          if (b.date && a.date) return b.date - a.date
          if (b._id && a._id) return String(b._id).localeCompare(String(a._id))
          return 0
        })
        setAppointments(sorted)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Cancel appointment
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

  // Initialize Razorpay Checkout
  const initPay = (order, appointmentId, keyId) => {
    const options = {
      key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Medicare',
      description: 'Doctor Consultation Fee',
      order_id: order.id,
      receipt: appointmentId,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + '/api/user/verify-razorpay',
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId
            },
            { headers: { token } }
          )

          if (data.success) {
            toast.success(data.message || 'Payment completed successfully!')
            getUserAppointments()
          } else {
            toast.error(data.message || 'Payment verification failed')
          }
        } catch (error) {
          console.error(error)
          toast.error(error.response?.data?.message || error.message || 'Payment verification failed')
        } finally {
          setPayingId(null)
        }
      },
      prefill: {
        name: userData?.name || '',
        email: userData?.email || '',
        contact: userData?.phone || ''
      },
      theme: {
        color: '#5f6FFF'
      },
      modal: {
        ondismiss: function () {
          setPayingId(null)
          toast.info('Payment window closed')
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', function (response) {
      setPayingId(null)
      toast.error(response.error?.description || 'Payment Failed')
    })
    rzp.open()
  }

  // Initiate Razorpay Payment
  const appointmentRazorpay = async (appointmentId) => {
    try {
      setPayingId(appointmentId)

      // Ensure Razorpay SDK is available
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Razorpay SDK failed to load.'))
          document.body.appendChild(script)
        })
      }

      const { data } = await axios.post(
        backendUrl + '/api/user/payment-razorpay',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        initPay(data.order, appointmentId, data.key_id)
      } else {
        setPayingId(null)
        toast.error(data.message || 'Failed to initialize payment')
      }
    } catch (error) {
      setPayingId(null)
      console.error(error)
      toast.error(error.response?.data?.message || error.message || 'Payment initialization failed')
    }
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
                className="w-32 bg-indigo-50 object-cover rounded"
                src={item.docData?.image}
                alt=""
              />
            </div>

            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold text-base">
                {item.docData?.name}
              </p>
              <p className="text-primary font-medium">{item.docData?.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address :</p>
              <p className="text-xs">{item.docData?.address?.line1}</p>
              <p className="text-xs">{item.docData?.address?.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>{" "}
                {item.slotDate} | {item.slotTime}
              </p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Fee:
                </span>{" "}
                ${item.amount}
              </p>
            </div>

            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button 
                  onClick={() => appointmentRazorpay(item._id)}
                  disabled={payingId === item._id}
                  className="text-sm text-stone-700 bg-white hover:bg-primary hover:text-white border border-stone-300 hover:border-primary text-center sm:min-w-48 py-2.5 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {payingId === item._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
                        <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2"/>
                      </svg>
                      <span>Pay Online (${item.amount})</span>
                    </>
                  )}
                </button>
              )}

              {!item.cancelled && item.payment && !item.isCompleted && (
                <div className="sm:min-w-48 py-2.5 border border-emerald-500 rounded-lg text-emerald-600 bg-emerald-50 font-medium flex items-center justify-center gap-1.5 shadow-sm text-sm">
                  <span className="font-bold text-base">✓</span> Paid Online
                </div>
              )}

              {item.isCompleted && (
                <div className="sm:min-w-48 py-2.5 border border-green-500 rounded-lg text-green-500 bg-green-50 text-center text-sm font-medium">
                  Completed
                </div>
              )}

              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button 
                  onClick={() => cancelAppointment(item._id)} 
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2.5 border rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 font-medium cursor-pointer"
                >
                  Cancel appointment
                </button>
              )}

              {item.cancelled && (
                <div className="sm:min-w-48 py-2.5 border border-red-500 rounded-lg text-red-500 bg-red-50 text-center text-sm font-medium">
                  Appointment cancelled
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments