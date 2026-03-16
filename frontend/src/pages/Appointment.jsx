import React, { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets'

const Appointment = () => {
  const { docId } = useParams();
  const { doctors,currencySymbol } = useContext(AppContext)

  const [docInfo, setDocInfo] = useState(null)
  const[docSlots ,setDocSlots] = useState([])
  const [slotIndex , setSlotIndex] = useEffect(0)
  const [slotTime,setSlotTime] = useState('');

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
     
  }

  const getAvailableSlots = async () =>{
    setDocSlots([])

    //getting current date
    let today = new Date()

    for(let i=0;i<7,i++){
      //getting date with index
      let currentDate =new Date(today)
      currentDate.setDate(today.getDate()+i)

      // Setting end time of date with index
      let endTime = new Date()
      endTime.setDate(today.getDate()+1)
      endTime.setHours(21,0,0,0)
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(()=>{
   getAvailableSlots()
  },[docInfo])

  return docInfo && (
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
  )
}

export default Appointment