import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
 

const AddDoctor = () => {

  const [docImg,setDocImg] = useState(false)
  const [name ,setName] = useState('')
  const [email ,setEmail] = useState('')
  const [password ,setPassword] = useState('')
  const [experience ,setExperience] = useState('')
  const [fees ,setFees] = useState('')
   
  const [about ,setAbout] = useState('')
  const [speciality ,setSpeciality] = useState('General physician')
  const [degree,setDegree] = useState('')
  const [address1,setAddress1] = useState('')
  const [address2,setAddress2] = useState('')
   

const {backendUrl , aToken} = useContext(AdminContext)

  const onSubmitHandler = async(event)=>{
    event.preventDefault()

    try {
      
      if(!docImg){
        return toast.error("Image not selected")
      }

       const formData = new FormData();
       formData.append('image',docImg)
       formData.append('name',name)
       formData.append('email',email)
       formData.append('password',password)
       formData.append('experience',experience)
       formData.append('fees',Number(fees))
       formData.append('about',about)
       formData.append('speciality',speciality)
       formData.append('degree',degree)
       formData.append('adresss',JSON.stringify({line1:address1,line2:address2}) )
// console log formdata
   

    } catch (error) {
      
    }
  }

  return (
    <form onSubmit= {onSubmitHandler} className='min-h-screen w-full p-4 bg-gray-50'>
      <div className='max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6'>
        
        <p className='text-xl font-semibold text-gray-800 mb-6 border-l-4 border-primary pl-3'>
          Add Doctor
        </p>
        
        <div className='flex flex-col lg:flex-row gap-6'>
          
          {/* Left Column - Image */}
          <div className='lg:w-1/3 flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg'>
            <label htmlFor="doc-img" className='cursor-pointer group'>
              <img 
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} 
                alt="Upload Area" 
                className='w-40 h-40 object-cover rounded-lg border-2 border-dashed border-gray-300 group-hover:border-primary transition-all duration-300 hover:scale-105'
              />
            </label>
            <input onChange={(e)=>setDocImg(e.target.files[0])} type="file" id='doc-img' hidden />
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
                  <input onChange={(e)=>setName(e.target.value)} value={name} type="text" placeholder='Name' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Doctor Email</p>
                  <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Your email' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Doctor Password</p>
                  <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Experience</p>
                  <input onChange={(e)=>setExperience(e.target.value)} value={experience} type="text" placeholder='Experience' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Fees</p>
                  <input onChange={(e)=>setFees(e.target.value)} value={fees} type="number" placeholder='Your fees' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className='flex flex-col gap-4'>
                
                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Speciality</p>
                  <select onChange={(e)=>setSpeciality(e.target.value)} value={speciality} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all'>
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
                  <input onChange={(e)=>setDegree(e.target.value)} value={degree} type="text" placeholder='Education' required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Address</p>
                  <input onChange={(e)=>setAddress1(e.target.value)} value={address1} type="text" placeholder='Address line 1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                  <input onChange={(e)=>setAddress2(e.target.value)} value={address2} type="text" placeholder='Address line 2'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'/>
                </div>

              </div>

            </div>

            {/* About */}
            <div className='mt-5'>
              <p className='text-sm font-semibold text-gray-700 mb-1'>About me</p>
              <textarea onChange={(e)=>setAbout(e.target.value)} value={about} rows="3" placeholder='write about yourself' required
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