import React from "react";
import { useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {

  const { getProfileData, profileData, dToken, setProfileData  ,backendUrl } =
    useContext(DoctorContext);
    
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    
    try {
      
  const updateData = {
    address: profileData.address,
    fees: profileData.fees,
    available: profileData.available
  }

 const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, {headers: { dToken }});
 if(data.success){
  toast.success(data.message)
  setIsEdit(false)
  getProfileData()
 } else {
  toast.error(data.message)
 }

    } catch (error) {
       toast.error(error.message)
       console.log(error);
    }

  }




  useEffect(() => {
    getProfileData();
  }, [dToken]);

  return (
    profileData && (
      <div className="w-full p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-row">
            {/* Left — Doctor Image */}
            <div className="w-56 shrink-0 bg-gradient-to-b from-primary/80 to-indigo-500 flex items-end justify-center overflow-hidden">
              <img
                src={profileData.image}
                alt=""
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Right — Info Panel */}
            <div className="flex-1 px-8 py-7 flex flex-col justify-between">
              {/* Top: Name, degree, experience */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1 hover:text-primary transition-colors duration-200 cursor-default">
                  {profileData.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-gray-500 text-sm">
                    {profileData.degree} – {profileData.speciality}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    {profileData.experience} Yrs
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-4"></div>

                {/* About */}
                <div className="mb-4 group">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    About
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {profileData.about}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-4"></div>

                {/* Fee */}
                <div className="flex items-center gap-2 mb-3 group">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-200 shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <p className="text-sm text-gray-600">
                    Appointment fee:{" "}
                    <span className="font-bold text-primary">
                      {currency}{" "}
                      {isEdit ? (
                        <input
                          type="number"
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              fees: e.target.value,
                            }))
                          }
                          value={profileData.fees}
                          className="border rounded px-2 py-1 w-24"
                        />
                      ) : (
                        profileData.fees
                      )}
                    </span>
                  </p>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 group">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-200 shrink-0 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                      Address
                    </p>

                    <p className="text-sm text-gray-600">
                      {isEdit ? (
                        <input
                          type="text"
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                line1: e.target.value,
                              },
                            }))
                          }
                          value={profileData.address.line1}
                          className="border rounded px-2 py-1 w-full mb-1"
                        />
                      ) : (
                        profileData.address.line1
                      )}
                    </p>

                    <p className="text-sm text-gray-600">
                      {isEdit ? (
                        <input
                          type="text"
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                line2: e.target.value,
                              },
                            }))
                          }
                          value={profileData.address.line2}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        profileData.address.line2
                      )}
                    </p>


                  </div>
                </div>
              </div>

              {/* Bottom: Available + Edit */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                {/* Available Checkbox */}
                <label
                  htmlFor="available"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 border border-green-100 hover:border-green-200 cursor-pointer transition-all duration-200 group"
                >

                  <input 
  onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
  checked={profileData.available}
  type="checkbox"
  id="available"
  className="w-4 h-4 accent-primary cursor-pointer rounded"
/>


                  <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors duration-200">
                    Available
                  </span>
                </label>

                {/* Edit Button */}

                {
                  isEdit 
                  ? <button
                  onClick={updateProfile}
                  className="relative overflow-hidden flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
                >
                  <svg
                    className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Save
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                  : <button
                  onClick={() => setIsEdit(true)}
                  className="relative overflow-hidden flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
                >
                  <svg
                    className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                }
                 

               
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
