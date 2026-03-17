import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm mx-4 md:mx-10 lg:mx-24'>
        <img className='w-full md:max-w-[360px] rounded-lg shadow-lg hover:scale-105 transition-all duration-300' src={assets.contact_image} alt="" />

        <div className='flex flex-col justify-center items-start gap-6 border border-gray-200 rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300'>
          <p className='font-semibold text-lg text-gray-800'>Our OFFICE</p>
          <p className='text-gray-600'>54709 Willms Station<br/>Suite 350, Washington, USA</p>
          <p className='text-gray-600'>Tel: (415) 555-0132<br/>Email: greatstackdev@gmail.com</p>
          <p className='font-semibold text-lg text-gray-800'>Careers at PRESCRIPTO</p>
          <p className='text-gray-600'>Learn more about our teams and job openings.</p>
          <button className='bg-primary text-white px-8 py-3 rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer'>
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default Contact