import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" })
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const userData = {
      name,
      email,
      password: hashedPassword
    }

    const newUser = new userModel(userData)
    const user = await newUser.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    res.json({ success: true, token })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API for user Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User does not exist" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "Invalid credentials" })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.user
    const userData = await userModel.findById(userId).select('-password')
    res.json({ success: true, userData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user
    const { name, phone, address, dob, gender } = req.body
    const imageFile = req.file

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" })
    }

    const updateData = {
      name,
      phone,
      dob,
      gender,
    }

    if (address) {
      try {
        updateData.address = JSON.parse(address)
      } catch (e) {
        updateData.address = address
      }
    }

    await userModel.findByIdAndUpdate(userId, updateData)

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: 'image',
        folder: 'user_profiles'
      })
      await userModel.findByIdAndUpdate(userId, { image: imageUpload.secure_url })
    }

    res.json({ success: true, message: "Profile Updated" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to book appointment 
// ✅ Corrected - SAFE
const bookAppointment = async (req, res) => {
  try {
    const { userId } = req.user; // ✅ From token - TRUSTED
    const { docId, slotDate, slotTime } = req.body; // ✅ Non-sensitive data from client
    
    // Check if doctor exists and is available
    const docData = await doctorModel.findById(docId).select('-password')
    
    if (!docData || !docData.available) {
      return res.json({ success: false, message: "Doctor not available" })
    }
    
    // Check slot availability
    let slots_booked = docData.slots_booked || {}
    
    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: 'Slot not available' })
    }
    
    // Book the slot
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = []
    }
    slots_booked[slotDate].push(slotTime)
    
    // Get user data
    const userData = await userModel.findById(userId).select('-password')
    
    // Create appointment
    const appointmentData = {
      userId,
      docId,
      userData,
      docData: {
        _id: docData._id,
        name: docData.name,
        speciality: docData.speciality,
        image: docData.image,
        fees: docData.fees
      },
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now()
    }
    
    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()
    
    // Update doctor's slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })
    
    res.json({ success: true, message: 'Appointment booked successfully' })
    
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment }