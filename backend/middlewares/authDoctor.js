import jwt from "jsonwebtoken";

// This middleware is used to authenticate doctors by verifying the JWT token provided in the request headers.
 

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    
    if (!dtoken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
    
    // ✅ Fix: Use req.doctor instead of req.body
    req.doctor = { docId: token_decode.id }
    
    next();
    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

 

export default authDoctor;