import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = forwardRef(({ name, value, onChange, children, className }, ref) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = React.Children.toArray(children).filter(
    (child) => child.type === "option"
  );

  const selectedOption = options.find((opt) => opt.props.value === value);

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange({ target: { name, value: optionValue } }); // mimic native select event
    }
    setOpen(false);
  };

  return (
    <div ref={(el) => {
      menuRef.current = el;
      if (ref) ref.current = el; // forward the ref
    }} className={`relative text-sm ${className || ""}`}>
      {/* Display Button */}
      <div
        onClick={() => setOpen(!open)}
        className="capitalize w-full flex items-center justify-between px-6 py-2.5 border border-gray-300 rounded-md cursor-pointer"
      >
        <span
          className={`truncate ${value ? "text-gray-800" : "text-gray-700"}`}
        >
          {selectedOption?.props.children ||
            `Select an Option`}
        </span>

        <ChevronDown className="text-gray-500" size={18} />
      </div>

      {/* Options Dropdown */}
      {open && (
        <div className="absolute z-999 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.props.value}
              onClick={() => handleSelect(opt.props.value)}
              className={`px-4 py-2.5 cursor-pointer 
                ${opt.props.value === value
                  ? "bg-[var(--accent-color)] text-[var(--primary-color)]"
                  : "text-gray-700 hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)]"
                }
              `}
            >
              {opt.props.children}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default CustomSelect;
