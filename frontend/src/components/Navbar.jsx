import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {

  const navigate = useNavigate();
const {token , setToken, userData} = useContext(AppContext)
  const [showMenu, setShowMemu] = useState(false)
   
const logout = () =>{
  setToken(false)
  localStorage.removeItem('token')
} 
  return (
    <div className='flex item-center justify-between ext-sm py-4 border-b border-b-gray-400'>
      <div onClick={()=>navigate('/')} className='flex items-center gap-3 cursor-pointer group select-none'>
        <svg width="38" height="38" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-105">
          <path d="M22.9997 0C35.7026 0 45.9997 10.2971 45.9997 23V39.1C45.9997 40.93 45.2728 42.685 43.9788 43.979C42.6848 45.273 40.9297 46 39.0997 46H24.1497V35.9099C24.1497 33.6076 24.29 31.2225 25.4975 29.2629C26.362 27.8586 27.5185 26.6566 28.8884 25.7385C30.2583 24.8204 31.8096 24.2077 33.4371 23.9419L33.8776 23.8706C34.0592 23.8085 34.2168 23.6912 34.3284 23.5351C34.44 23.379 34.5 23.1919 34.5 23C34.5 22.8081 34.44 22.621 34.3284 22.4649C34.2168 22.3088 34.0592 22.1915 33.8776 22.1294L33.4371 22.0581C31.0591 21.6697 28.8632 20.5441 27.1594 18.8403C25.4556 17.1365 24.3301 14.9406 23.9416 12.5626L23.8703 12.1222C23.8082 11.9406 23.6909 11.7829 23.5348 11.6713C23.3787 11.5597 23.1916 11.4997 22.9997 11.4997C22.8078 11.4997 22.6208 11.5597 22.4647 11.6713C22.3086 11.7829 22.1913 11.9406 22.1292 12.1222L22.0579 12.5626C21.7922 14.1902 21.1795 15.7415 20.2614 17.1114C19.3433 18.4814 18.1412 19.6378 16.7368 20.5022C14.7772 21.7097 12.3921 21.85 10.0898 21.85H0.0273438C0.628794 9.68185 10.6832 0 22.9997 0Z" fill="#5F6FFF"/>
          <path d="M0 24.15H10.0901C12.3924 24.15 14.7775 24.2903 16.7371 25.4978C18.2689 26.4417 19.5583 27.7311 20.5022 29.2629C21.7097 31.2225 21.85 33.6076 21.85 35.9099V46H6.9C5.07001 46 3.31496 45.273 2.02096 43.979C0.726962 42.685 0 40.93 0 39.1L0 24.15ZM46 2.3C46 2.91 45.7577 3.49501 45.3263 3.92635C44.895 4.35768 44.31 4.6 43.7 4.6C43.09 4.6 42.505 4.35768 42.0737 3.92635C41.6423 3.49501 41.4 2.91 41.4 2.3C41.4 1.69 41.6423 1.10499 42.0737 0.673654C42.505 0.242321 43.09 0 43.7 0C44.895 0.242321 45.3263 0.673654C45.7577 1.10499 46 1.69 46 2.3Z" fill="#5F6FFF"/>
        </svg>
        <span className='text-2xl font-bold tracking-tight text-gray-800 font-sans'>
          Medi<span className='text-primary'>care</span>
        </span>
      </div>

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to='/'>
          <li  className="py-1">Home</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
        </NavLink>

        <NavLink to='/doctors'>
          <li className="py-1">ALL Doctors</li>
          <hr className='border-none outline-none h-0.5  bg-primary w-3/5  m-auto hidden'/>
        </NavLink>

        <NavLink to='/about'>
          <li className="py-1">ABOUT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
        </NavLink>

        <NavLink to='/contact'>
          <li className="py-1">CONTACT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto  hidden'/>
        </NavLink>
      </ul>

      <div className="flex item-center gap-4">
        {
          token 
          ? <div className="flex item-center gap-2 cursor-pointer group relative "> 
            <img className='w-8 h-8 rounded-full object-cover border border-gray-200' src={(userData && (userData.image || userData.Image)) || assets.profile_pic} onError={(e) => { e.target.onerror = null; e.target.src = assets.profile_pic; }} alt="" />
            <img  className='w-2.5 'src={assets.dropdown_icon} alt="" />

            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-grey-600 z-20 hidden group-hover:block "> 
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                
                <p onClick={()=>navigate('my-profile')}className='hover:text-black cursor-pointer'>My Profile</p>

                <p onClick={()=>navigate('my-appointments')}className='hover:text-black cursor-pointer'>My Appointments</p>

                <p onClick={logout}className='hover:text-black cursor-pointer'>Logout</p>

              </div>
            </div>
          </div> 
          : <button onClick={()=>navigate('/login')} className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block">Create Account</button>
        }

        <img  onClick = {()=>setShowMemu(true)}className = 'w-6 md:hidden'src={assets.menu_icon} alt="" />

        {/*---Mobile menu -- */}
        <div className={` ${showMenu  ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 overflow-hidden bg-white transition-all`}>
          <div className="flex items-center justify-between px-5 py-6">
            <div onClick={()=>{navigate('/'); setShowMemu(false)}} className='flex items-center gap-2 cursor-pointer select-none'>
              <svg width="32" height="32" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.9997 0C35.7026 0 45.9997 10.2971 45.9997 23V39.1C45.9997 40.93 45.2728 42.685 43.9788 43.979C42.6848 45.273 40.9297 46 39.0997 46H24.1497V35.9099C24.1497 33.6076 24.29 31.2225 25.4975 29.2629C26.362 27.8586 27.5185 26.6566 28.8884 25.7385C30.2583 24.8204 31.8096 24.2077 33.4371 23.9419L33.8776 23.8706C34.0592 23.8085 34.2168 23.6912 34.3284 23.5351C34.44 23.379 34.5 23.1919 34.5 23C34.5 22.8081 34.44 22.621 34.3284 22.4649C34.2168 22.3088 34.0592 22.1915 33.8776 22.1294L33.4371 22.0581C31.0591 21.6697 28.8632 20.5441 27.1594 18.8403C25.4556 17.1365 24.3301 14.9406 23.9416 12.5626L23.8703 12.1222C23.8082 11.9406 23.6909 11.7829 23.5348 11.6713C23.3787 11.5597 23.1916 11.4997 22.9997 11.4997C22.8078 11.4997 22.6208 11.5597 22.4647 11.6713C22.3086 11.7829 22.1913 11.9406 22.1292 12.1222L22.0579 12.5626C21.7922 14.1902 21.1795 15.7415 20.2614 17.1114C19.3433 18.4814 18.1412 19.6378 16.7368 20.5022C14.7772 21.7097 12.3921 21.85 10.0898 21.85H0.0273438C0.628794 9.68185 10.6832 0 22.9997 0Z" fill="#5F6FFF"/>
                <path d="M0 24.15H10.0901C12.3924 24.15 14.7775 24.2903 16.7371 25.4978C18.2689 26.4417 19.5583 27.7311 20.5022 29.2629C21.7097 31.2225 21.85 33.6076 21.85 35.9099V46H6.9C5.07001 46 3.31496 45.273 2.02096 43.979C0.726962 42.685 0 40.93 0 39.1L0 24.15ZM46 2.3C46 2.91 45.7577 3.49501 45.3263 3.92635C44.895 4.35768 44.31 4.6 43.7 4.6C43.09 4.6 42.505 4.35768 42.0737 3.92635C41.6423 3.49501 41.4 2.91 41.4 2.3C41.4 1.69 41.6423 1.10499 42.0737 0.673654C42.505 0.242321 43.09 0 43.7 0C44.895 0.242321 45.3263 0.673654C45.7577 1.10499 46 1.69 46 2.3Z" fill="#5F6FFF"/>
              </svg>
              <span className='text-xl font-bold tracking-tight text-gray-800 font-sans'>
                Medi<span className='text-primary'>care</span>
              </span>
            </div>
            <img className="w-7" onClick = {()=>setShowMemu(false)}src={assets.cross_icon} alt="" />
          </div>
          <ul className="flex flex-col items-center gap-2 px-5 mt-5 text-lg font-medium">

            <NavLink   onClick= {()=>setShowMemu(false)} to= '/'> <p className= 'px-4 py-2 rounded inline-block'>HOME</p></NavLink>

            <NavLink   onClick= {()=>setShowMemu(false)} to= '/doctors'> <p className= 'px-4 py-2 rounded inline-block'>ALL DOCTORS</p></NavLink>
            <NavLink   onClick= {()=>setShowMemu(false)}  to= '/about'> <p className= 'px-4 py-2 rounded inline-block'>ABOUT</p></NavLink>
            <NavLink   onClick= {()=>setShowMemu(false)} to= '/contact'> <p  className= 'px-4 py-2 rounded inline-block'>CONTACT</p></NavLink>
          </ul>
        </div>
      </div>
    </div>

    
  );
};

export default Navbar;
