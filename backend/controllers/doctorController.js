import doctorModel from "../models/doctorModel.js"

const changeAvailabilty = async (req,res)=>{
  try {
    const {docId} = req.body
    const docData = await doctorModel.findById(docId)
    
    if (!docData) {
      return res.json({success: false, message: "Doctor not found"})
    }
    
    await doctorModel.findByIdAndUpdate(docId, {available: !docData.available})
    res.json({success: true, message: "Availability changed successfully"}) //  Fixed message
  } catch (error) {
    console.log(error)
    res.json({success: false, message: error.message})
  }
}

const doctorList =async (req,res) =>{
  try {
    const doctors = await doctorModel.find({}).select(['-password' , '-email'])
    res.json({success:true , doctors})
  } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
  }
}
export {changeAvailabilty , doctorList}