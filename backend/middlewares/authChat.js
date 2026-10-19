import jwt from "jsonwebtoken";

const authChat = async (req, res, next) => {
  try {
    const userToken = req.headers.token;
    const doctorToken = req.headers.dtoken;
    const authHeader = req.headers.authorization;

    let token = userToken || doctorToken;
    let expectedRole = null;

    if (userToken) {
      expectedRole = "user";
    } else if (doctorToken) {
      expectedRole = "doctor";
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login to access chat.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please login again.",
      });
    }

    // Determine role if not already identified
    const role = expectedRole || (req.headers["x-user-role"] === "doctor" ? "doctor" : "user");

    req.auth = {
      id: decoded.id,
      role: role,
    };

    if (role === "user") {
      req.user = { userId: decoded.id };
    } else {
      req.doctor = { docId: decoded.id };
    }

    next();
  } catch (error) {
    console.error("Chat Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please log in again.",
    });
  }
};

export default authChat;
