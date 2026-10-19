import { json } from "express";
import jwt from "jsonwebtoken";

//admin authentication middleware

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
    const validAdminTokens = [
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD,
      'admin@medicare.com' + process.env.ADMIN_PASSWORD
    ];
    if (!validAdminTokens.includes(token_decode)) {
      return res.json({ success: false, message: "Not Authorised Login" });
    }
    next()
    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
export default authAdmin;
