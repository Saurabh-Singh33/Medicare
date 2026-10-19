import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'
import razorpay from 'razorpay'

// Gateway initialize
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.key_id,
  key_secret: process.env.RAZORPAY_KEY_SECRET || process.env.key_secret
})

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" })
    }

    const cleanEmail = email.trim().toLowerCase()

    if (!validator.isEmail(cleanEmail)) {
      return res.json({ success: false, message: "Enter a valid email" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters long" })
    }

    const exists = await userModel.findOne({ email: cleanEmail })
    if (exists) {
      return res.json({ success: false, message: "User already exists with this email" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const userData = {
      name: name.trim(),
      email: cleanEmail,
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

    if (!email || !password) {
      return res.json({ success: false, message: "Please provide email and password" })
    }

    const cleanEmail = email.trim().toLowerCase()
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } 
    })

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
    const user = await userModel.findById(userId).select('-password')
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }
    const userData = user.toObject ? user.toObject() : user
    userData.image = userData.image || userData.Image || ""
    userData.Image = userData.image

    // Normalize address
    if (typeof userData.address === 'string') {
      try {
        userData.address = JSON.parse(userData.address)
      } catch (e) {
        userData.address = { line1: userData.address, line2: '' }
      }
    }
    if (!userData.address || typeof userData.address !== 'object') {
      userData.address = { line1: '', line2: '' }
    }
    if (!userData.address.line1) userData.address.line1 = ''
    if (!userData.address.line2) userData.address.line2 = ''

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

    if (!name) {
      return res.json({ success: false, message: "Name is required" })
    }

    const updateData = {
      name,
      phone: phone || "0000000000",
      dob: dob || "Not Selected",
      gender: gender || "Not Selected",
    }

    if (address && address !== 'undefined') {
      try {
        updateData.address = JSON.parse(address)
      } catch (e) {
        updateData.address = address
      }
    }

    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: 'image',
          folder: 'user_profiles'
        })
        updateData.image = imageUpload.secure_url
        updateData.Image = imageUpload.secure_url

        // Cleanup temp file
        fs.unlink(imageFile.path, () => {})
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr)
        return res.json({ success: false, message: "Image upload failed: " + uploadErr.message })
      }
    }

    await userModel.findByIdAndUpdate(userId, updateData)

    // Sync updated user details into existing appointments
    const appointmentUserUpdates = {
      'userData.name': updateData.name,
      'userData.phone': updateData.phone,
      'userData.dob': updateData.dob,
      'userData.gender': updateData.gender
    }
    if (updateData.image) {
      appointmentUserUpdates['userData.image'] = updateData.image
      appointmentUserUpdates['userData.Image'] = updateData.image
    }
    if (updateData.address) {
      appointmentUserUpdates['userData.address'] = updateData.address
    }
    await appointmentModel.updateMany({ userId }, { $set: appointmentUserUpdates })

    res.json({ success: true, message: "Profile Updated" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to book appointment 
const bookAppointment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { docId, slotDate, slotTime } = req.body;

    

    if (!slotTime) {
      return res.json({ success: false, message: "Slot time is required" });
    }

    // Get doctor data
    const docData = await doctorModel.findById(docId).select('-password');

    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked || {};

    // Check if slot is already booked
    if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" });
    }

    // Book the slot
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    }
    slots_booked[slotDate].push(slotTime);

    // Get user data
    const userData = await userModel.findById(userId).select('-password');

    // ✅ Create appointment data with COMPLETE docData including address
    const appointmentData = {
      userId,
      docId,
      userData,
      docData: {
        _id: docData._id,
        name: docData.name,
        speciality: docData.speciality,
        image: docData.image,
        fees: docData.fees,
        address: docData.address  // ✅ Add address here!
      },
      amount: docData.fees,
      slotTime,      // ✅ Make sure slotTime is included
      slotDate,      // ✅ Make sure slotDate is included
      date: Date.now()
    };

   

    // Save appointment
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Update doctor's slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment booked successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// API to get user appointment for frontend my-appointment-page

const listAppointment =async(req,res)=>{
  try {
    const {userId} = req.user


    const appointments = await appointmentModel.find({userId}).sort({ date: -1, _id: -1 })

    res.json({success:true,appointments})

  } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
  }
}

// API to cancel Appointment 

// API to cancel Appointment 
const cancelAppointmnet = async (req, res) => {
  try {
    const { userId } = req.user  // ✅ From token
    const { appointmentId } = req.body  // ✅ From request body

    // Find the appointment
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" })
    }

    // Verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized Action' })
    }

    if (appointmentData.payment) {
      return res.json({ success: false, message: "Paid appointments cannot be cancelled directly. Please contact clinic support." })
    }

    // Cancel the appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // Release doctor slot
    const { docId, slotDate, slotTime } = appointmentData
    const doctorData = await doctorModel.findById(docId)

    if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
      let slots_booked = doctorData.slots_booked
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
      await doctorModel.findByIdAndUpdate(docId, { slots_booked })
    }

    res.json({ success: true, message: 'Appointment cancelled successfully' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

 

// API to make payment of appointment using Razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled or not found" })
    }

    if (appointmentData.payment) {
      return res.json({ success: false, message: "Payment already completed" })
    }

    // Creating options for razorpay payment
    const currency = process.env.CURRENCY || 'INR'
    const options = {
      amount: Math.round(appointmentData.amount * 100),
      currency: currency,
      receipt: appointmentId.toString()
    }

    // Creation of an order
    const order = await razorpayInstance.orders.create(options)

    res.json({ 
      success: true, 
      order,
      key_id: process.env.RAZORPAY_KEY_ID || process.env.key_id 
    })

  } catch (error) {
    console.log("Razorpay Order Creation Error:", error)
    res.json({ success: false, message: error.message })
  }
}

// API to verify payment of Razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body

    if (!appointmentId) {
      return res.json({ success: false, message: "Appointment ID is required" })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.key_secret
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generated_signature === razorpay_signature) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
      res.json({ success: true, message: "Payment completed successfully" })
    } else {
      res.json({ success: false, message: "Payment verification failed" })
    }

  } catch (error) {
    console.log("Razorpay Verification Error:", error)
    res.json({ success: false, message: error.message })
  }
}

export { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile, 
  bookAppointment,
  listAppointment, 
  cancelAppointmnet,
  paymentRazorpay,
  verifyRazorpay 
}