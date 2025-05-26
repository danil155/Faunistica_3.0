import React from "react";
import "./toggleButton.css";

const PinToggle = ({isChecked = false, onChange}) => {
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.checked);
        }
    };

    return (
        <label className="lock-toggle">
            <input
                name="lock_toggle"
                type="checkbox"
                className="lock-toggle-input"
                checked={isChecked}
                onChange={handleChange}
            />
            <span className="lock-toggle-icon"/>
        </label>
    );
};

export default PinToggle;