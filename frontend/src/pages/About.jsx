import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12 mx-4 md:mx-10 lg:mx-24'>
        <img className='w-full md:max-w-[360px] rounded-lg shadow-lg hover:scale-105 transition-all duration-300' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600 border border-gray-200 rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300'>
          <p>Prescripto is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, Prescripto is here to support you every step of the way.</p>
          
          <b className='text-gray-800 text-lg'>Our Vision</b>
          
          <p>Our vision at Prescripto is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.</p>
        </div>
      </div>

      <div className='text-xl my-8 text-center'>
        <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20 gap-5 mx-4 md:mx-10 lg:mx-24'>
        <div className='border border-gray-200 px-8 md:px-12 py-8 sm:py-16 flex flex-col gap-5 text-[15px] rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:border-primary hover:bg-gray-50 transition-all duration-300 cursor-pointer'>
          <b className='text-lg text-gray-800'>Efficiency:</b>
          <p className='text-gray-600'>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
        </div>
        <div className='border border-gray-200 px-8 md:px-12 py-8 sm:py-16 flex flex-col gap-5 text-[15px] rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:border-primary hover:bg-gray-50 transition-all duration-300 cursor-pointer'>
          <b className='text-lg text-gray-800'>Convenience:</b>
          <p className='text-gray-600'>Access to a network of trusted healthcare professionals in your area.</p>
        </div>
        <div className='border border-gray-200 px-8 md:px-12 py-8 sm:py-16 flex flex-col gap-5 text-[15px] rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:border-primary hover:bg-gray-50 transition-all duration-300 cursor-pointer'>
          <b className='text-lg text-gray-800'>Personalization:</b>
          <p className='text-gray-600'>Tailored recommendations and reminders to help you stay on top of your health.</p>
        </div>
      </div>
    </div>
  )
}

export default About