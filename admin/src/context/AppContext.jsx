import { createContext } from "react";

export const AppContext = createContext()

const AppContextProvider = (props) =>{

  // Variable for currency 
   
   const currency ='$'

  const calculateAge = (dob) =>{
   const today = new Date()
   const birthDate = new Date(dob)

   let age = today.getFullYear() - birthDate.getFullYear()
   return age
  }

// Define months array first
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

// Corrected slotDateFormat function
const slotDateFormat = (slotDate) => {
  // Assuming slotDate format is like "26-3-2026" (day-month-year)
  const dateArray = slotDate.split('-')
  // dateArray[0] = day, dateArray[1] = month, dateArray[2] = year
  return dateArray[0] + " " + months[parseInt(dateArray[1]) - 1] + " " + dateArray[2]
}

  const value = {
    calculateAge,slotDateFormat,currency
  }
  return (
    <AppContext.Provider value={value}>
   {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider