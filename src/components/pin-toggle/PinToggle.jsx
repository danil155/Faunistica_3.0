import React, { useState } from "react";
import closedLock from "../../img/lock-closed.svg";
import openLock from "../../img/lock-open.svg";
import "./toggleButton.css";

const PinToggle = ({ isChecked = false, onChange }) => {
    const handleChange = (e) => {
      if (onChange) {
        onChange(e.target.checked);
      }
    };
  
    return (
      <label className="lock-toggle">
        <input
          type="checkbox"
          className="lock-toggle-input"
          checked={isChecked}
          onChange={handleChange}
        />
        <span className="lock-toggle-icon" />
      </label>
    );
  };
  
  
  export default PinToggle;