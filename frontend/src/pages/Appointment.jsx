import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol ,backendUrl , token,getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN' , 'MON' , 'TUE' , 'WED','THU' , 'FRI' , 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)  // Fixed: changed from useEffect to useState
  const [slotTime, setSlotTime] = useState('');

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
  //  if (!docInfo) return; // Add null check
    
    setDocSlots([])

    //getting current date
    let today = new Date()

    for (let i = 0; i < 7; i++) {
      //getting date with index
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      // Setting end time of date with index
      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      //setting hours 
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }
      
      let timeSlots = []
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

   let day = currentDate.getDate()
   let month = currentDate.getMonth() +1
   let year  = currentDate.getFullYear()

   const slotDate = day + "-" + month +"-" + year
   const slotTime = formattedTime

   const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false :true

   if (isSlotAvailable) {
    //Add slot to array 
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime
        })
   }
         

        //increment current time by 30 minutes 
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }
      setDocSlots(prev => ([...prev, timeSlots]))
    }
  }

  const bookAppointment = async () => {
  if (!token) {
    toast.warn('Login to book appointment')
    return navigate('/login')
  }

  try {
    const date = docSlots[slotIndex][0].datetime

    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    const slotDate = day + "-" + month + "-" + year

    const { data } = await axios.post(
      backendUrl + '/api/user/book-appointment', 
      { docId, slotDate, slotTime }, 
      { headers: { token } }
    )

    if (data.success) {
      toast.success(data.message)  // ✅ Fixed here
      getDoctorsData()
      navigate('/my-appointments')
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    console.log(error)
    toast.error(error.message)
  }
}
  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo]) // Added docInfo dependency

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots])

  return docInfo && (
    <div>
      <div className='flex flex-col sm:flex-row gap-5'>
        {/*-----------Doctor Image */}
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        
        {/*-----------Doctor Details */}
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0'>
          
          {/* Doc Info : name, degree, experience */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>

          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          {/* Doctor About */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>

          <p className='text-sm font-medium text-gray-900 mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Booking Slots Section  */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item,index)=>(
              <div onClick={()=>setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {
            docSlots.length &&  docSlots[slotIndex].map((item,index)=>
           <p onClick={()=>setSlotTime(item.time)}
  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}
  key={index}
>
  {item.time.toLowerCase()}
</p>
            )
          }
        </div>
        <div className="flex flex-wrap items-center gap-4 my-6">
          <button onClick={bookAppointment} className='bg-primary hover:bg-primary/95 text-white text-sm font-light px-10 py-3 rounded-full shadow-sm cursor-pointer'>
            Book an Appointment
          </button>
          <button 
            onClick={() => {
              if (!token) {
                toast.info("Please login to chat with doctor");
                navigate('/login');
              } else {
                navigate(`/messages/${docId}`);
              }
            }}
            className='bg-white text-primary border border-primary/40 hover:bg-primary hover:text-white text-sm px-8 py-3 rounded-full transition-all duration-300 font-medium flex items-center gap-2 cursor-pointer shadow-xs'
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chat with Doctor</span>
          </button>
        </div>
      </div>

      {/*---Listing related doctors */}
      <RelatedDoctors  docId={docId} speciality = {docInfo.speciality}/>
    </div>
  )
}

export default Appointment