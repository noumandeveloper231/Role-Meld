import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ChevronDown } from "lucide-react";

const DROPDOWN_HEIGHT = 240;

const CustomSelect = forwardRef(
  (
    {
      name,
      value,
      onChange,
      children,
      className = "",
      placeholder = "Select an option",
      disabled = false,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [direction, setDirection] = useState("bottom");
    const [highlighted, setHighlighted] = useState(false);

    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);
    const timeoutRef = useRef(null);

    useImperativeHandle(ref, () => ({
      highlight: () => {
        if (disabled) return;

        buttonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setHighlighted(true);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setHighlighted(false);
        }, 900);
      },
      focus: () => buttonRef.current?.focus(),
    }));

    useEffect(() => {
      return () => clearTimeout(timeoutRef.current);
    }, []);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const options = React.Children.toArray(children).filter(
      (child) => React.isValidElement(child) && child.type === "option"
    );

    const selectedOption = options.find(
      (opt) => opt.props.value === value
    );

    const decideDirection = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setDirection(
        spaceBelow < DROPDOWN_HEIGHT && spaceAbove > spaceBelow
          ? "top"
          : "bottom"
      );
    };

    const handleToggle = () => {
      if (disabled) return;
      decideDirection();
      setOpen((p) => !p);
    };

    const handleSelect = (optionValue) => {
      if (disabled) return;
      onChange?.({ target: { name, value: optionValue } });
      setOpen(false);
    };

    return (
      <div ref={wrapperRef} className={`relative text-sm`}>
        {/* Button */}
        <div
          ref={buttonRef}
          tabIndex={disabled ? -1 : 0}
          onClick={handleToggle}
          className={`${className} w-full flex items-center justify-between px-6 py-2.5 border rounded-md transition-all outline-none
            ${
              highlighted
                ? "ring-2 ring-blue-500 border-blue-500"
                : disabled
                ? "bg-gray-100 cursor-not-allowed text-gray-400"
                : "cursor-pointer border-gray-300"
            }
          `}
        >
          <span
            className={`truncate ${
              value ? "text-gray-800" : "text-gray-500"
            }`}
          >
            {selectedOption?.props.children || placeholder}
          </span>

          <ChevronDown size={18} className="text-gray-500" />
        </div>

        {/* Dropdown */}
        {open && !disabled && (
          <div
            className={`absolute z-[999] w-full bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto
              ${direction === "bottom" ? "mt-1 top-full" : "mb-1 bottom-full"}
            `}
          >
            {options.map((opt) => (
              <div
                key={opt.props.value}
                onClick={() => handleSelect(opt.props.value)}
                className={`px-4 py-2.5 cursor-pointer capitalize
                  ${
                    opt.props.value === value
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
  }
);

export default CustomSelect;
