import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import axios from 'axios'
import crypto from 'crypto'

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


    const appointments = await appointmentModel.find({userId})

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

 

const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64')
    
    const response = await axios.post(
      `${process.env.PAYPAL_MODE === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    
    return response.data.access_token
  } catch (error) {
    console.error('Error getting PayPal token:', error.response?.data || error.message)
    throw error
  }
}

const paymentPaypal = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment not available" })
    }

    if (appointmentData.payment) {
      return res.json({ success: false, message: "Payment already completed" })
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const accessToken = await getPayPalAccessToken()

    const orderResponse = await axios.post(
      `${process.env.PAYPAL_MODE === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: appointmentId,
            amount: {
              currency_code: 'USD',  // ✅ Use USD (supported)
              value: appointmentData.amount.toFixed(2)
            },
            description: `Appointment payment for Dr. ${appointmentData.docData?.name || 'Doctor'}`
          }
        ],
        application_context: {
          return_url: `${frontendUrl}/my-appointments`,
          cancel_url: `${frontendUrl}/my-appointments`,
          user_action: 'PAY_NOW'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    res.json({ 
      success: true, 
      orderId: orderResponse.data.id
    })

  } catch (error) {
    console.log('PayPal Error:', error.response?.data || error.message)
    res.json({ 
      success: false, 
      message: error.response?.data?.message || "Payment initialization failed" 
    })
  }
}
const capturePaypalPayment = async (req, res) => {
  try {
    const { orderId, appointmentId } = req.body
    
    const accessToken = await getPayPalAccessToken()
    
    const captureResponse = await axios.post(
      `${process.env.PAYPAL_MODE === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (captureResponse.data.status === 'COMPLETED') {
      // ✅ Just mark payment as true - no INR storage needed
      await appointmentModel.findByIdAndUpdate(appointmentId, { 
        payment: true
      })
      
      res.json({ success: true, message: "Payment completed successfully" })
    } else {
      res.json({ success: false, message: "Payment not completed" })
    }
    
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.response?.data?.message || error.message })
  }
}
    

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment,listAppointment, cancelAppointmnet,paymentPaypal,
  capturePaypalPayment }