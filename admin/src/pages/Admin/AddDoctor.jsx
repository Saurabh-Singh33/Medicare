import React from 'react'
import { assets } from '../../assets/assets'

const AddDoctor = () => {
  return (
    <form className='min-h-screen w-full p-4 bg-gray-50'>
      <div className='max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6'>
        
        <p className='text-xl font-semibold text-gray-800 mb-6 border-l-4 border-primary pl-3'>
          Add Doctor
        </p>
        
        <div className='flex flex-col lg:flex-row gap-6'>
          
          {/* Left Column - Image */}
          <div className='lg:w-1/3 flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg'>
            <label htmlFor="doc-img" className='cursor-pointer group'>
              <img 
                src={assets.upload_area} 
                alt="Upload Area" 
                className='w-40 h-40 object-cover rounded-lg border-2 border-dashed border-gray-300 group-hover:border-primary transition-all duration-300 hover:scale-105'
              />
            </label>
            <input type="file" id='doc-img' hidden />
            <p className='text-xs text-gray-500 text-center font-medium'>
              Upload doctor picture
            </p>
          </div>

          {/* Right Column */}
          <div className='lg:w-2/3 w-full'>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              
              {/* LEFT SIDE */}
              <div className='flex flex-col gap-4'>
                
                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Doctor name</p>
                  <input type="text" placeholder='Name' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Doctor Email</p>
                  <input type="email" placeholder='Your email' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Doctor Password</p>
                  <input type="password" placeholder='Password' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Experience</p>
                  <input type="text" placeholder='Experience' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Fees</p>
                  <input type="number" placeholder='Your fees' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className='flex flex-col gap-4'>
                
                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Speciality</p>
                  <select className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all'>
                    <option>General physician</option>
                    <option>Gynecologist</option>
                    <option>Dermatologist</option>
                    <option>Pediatricians</option>
                    <option>Neurologist</option>
                    <option>Gastroenterologist</option>
                  </select>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Education</p>
                  <input type="text" placeholder='Education' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Address</p>
                  <input type="text" placeholder='Address line 1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                  <input type="text" placeholder='Address line 2'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

              </div>

            </div>

            {/* About */}
            <div className='mt-5'>
              <p className='text-sm font-semibold text-gray-700 mb-1'>About me</p>
              <textarea rows="3" placeholder='write about yourself' required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all'/>
            </div>

            {/* Button */}
            <div className='mt-6'>
              <button type="submit"
                className='bg-primary text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-md hover:scale-105 active:scale-95'>
                Add doctor
              </button>
            </div>

          </div>
        </div>
      </div>
    </form>
  )
}

export default AddDoctor