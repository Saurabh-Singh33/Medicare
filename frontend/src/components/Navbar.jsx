import React from "react";
import { assets } from "../assets/assets";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div >
      <img src={assets.logo} alt=""/>
      <ul>
        <NavLink>
          <li>Home</li>
          <hr/>
        </NavLink>

        <NavLink>
          <li>ALL Doctors</li>
          <hr/>
        </NavLink>

        <NavLink>
          <li>ABOUT</li>
          <hr/>
        </NavLink>

        <NavLink>
          <li>CONTACT</li>
          <hr/>
        </NavLink>
      </ul>

      <div>
        <button>Create Account</button>
      </div>
    </div>

    
  );
};

export default Navbar;
