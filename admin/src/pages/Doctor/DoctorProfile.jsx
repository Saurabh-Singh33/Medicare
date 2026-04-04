import React from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { useEffect } from 'react'
 

const DoctorProfile = () => {

 const { getProfileData, profileData, dToken, setProfileData } = useContext(DoctorContext)

  const {currency,backendUrl} = useContext(AppContext)

 useEffect(() => {
  getProfileData()
}, [dToken])

  return  profileData && (
    <div>
      <div>
        <div>
          <img src={profileData.image} alt="" />
        </div>

        <div>
          {/**  DOC info name , degree , experience */}

          <p>{profileData.name}</p>
          <div>
            <p>{profileData.degree} -{profileData.speciality}</p>
        <button>{profileData.experience} years of experience</button>
             
          </div>

          {/** Doctor about info */}

          <div>
            <p>About</p>
            <p>
              
                {profileData.about}
            </p>
          </div>
          <p>
            Appointment fee : <span>{currency} {profileData.fees}</span>
          </p>

          <div>
            <p>Address :</p>
            <p>{profileData.address.line1} <br />{profileData.address.line2}</p>
            
             
      
          </div>

          <div>
            <input type="checkbox" name="" id="" />
            <label htmlFor="available">Available</label>
          </div>

          <button>Edit Profile</button>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
