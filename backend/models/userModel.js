import mongoose from "mongoose";
 

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "https://res.cloudinary.com/dzt092f9o/image/upload/v1792113460/user_profiles/o5w4367oe6xropok6ozq.png" },
  Image: { type: String, default: "https://res.cloudinary.com/dzt092f9o/image/upload/v1792113460/user_profiles/o5w4367oe6xropok6ozq.png" },

  address: { type: Object, default:{line1:'',line2:''} },
  gender: { type: String, default: "Not Selected" },
  dob: { type: String, default: "Not Selected" },
  phone: { type: String, default: "0000000000" },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
