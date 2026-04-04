import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to change doctor availability
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);

    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability changed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.doctor; // ✅ Get from req.doctor (auth middleware)
    const appointments = await appointmentModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for doctor panel
const appointementComplete = async (req, res) => {
  try {
    const { docId } = req.doctor; // ✅ Get docId from auth middleware
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({
        success: true,
        message: "Appointment marked as completed",
      });
    } else {
      return res.json({
        success: false,
        message: "Appointment not found or unauthorized",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointementCancel = async (req, res) => {
  try {
    const { docId } = req.doctor; // ✅ Get docId from auth middleware
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({
        success: true,
        message: "Appointment cancelled successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Appointment not found or unauthorized",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.doctor; // ✅ Correct

    const appointments = await appointmentModel.find({ docId }); // ✅ Correct

    let earnings = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        // ✅ Correct
        earnings += item.amount;
      }
    });

    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        // ✅ Correct
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5), // ✅ Correct
    };

    res.json({ success: true, dashData }); // ✅ Correct
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message }); // ✅ Correct
  }
};

//API to get Doctor Profile for Doctor Panel

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.doctor;
    const doctorData = await doctorModel.findById(docId).select("-password");
    
    res.json({ success: true, doctorData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to update Doctor Profile form Doctor Panel

const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.doctor; // ✅ Get docId from auth middleware

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available }); // ✅ Update doctor profile
    res.json({ success: true, message: "Profile updated successfully" }); // ✅ Success response
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message }); // ✅ Correct
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointementComplete,
  appointementCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
