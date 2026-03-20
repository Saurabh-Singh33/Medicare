import validator from 'validator';
import bcrypt from 'bcrypt'
import {v2 as cloudnary} from 'cloudinary';
import doctorModel from "../models/doctorModel.js"
// API for Adding doctor 

const addDoctor = async (req, res) => {
  try {

    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    // validation
    if (!name || !email || !password || !speciality || !degree || !experience || !address) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be 8 chars" });
    }

    // hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // image optional
    const image = imageFile ? imageFile.filename : "";

    const doctorData = {
      name,
      email,
      password: hashedPassword,
      image,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now()
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor added" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {addDoctor}