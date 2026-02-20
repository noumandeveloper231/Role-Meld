import { useState, useEffect, useMemo, useContext } from "react";
import CustomSelect from "./CustomSelect";
import { AppContext } from "../context/AppContext";
import { Check } from "lucide-react";
import { IoIosWarning } from "react-icons/io";
import Tooltip from "./Tooltip";
import { useNavigate } from "react-router-dom";

function PhoneInputField({
    value = "",
    onChange,
    placeholder = "Phone number",
    defaultCountry = "+1",
    className = "",
    setFormData
}) {
    const navigate = useNavigate()
    const { userData } = useContext(AppContext);
    const [rawCountries, setRawCountries] = useState([]);
    const [countryCode, setCountryCode] = useState(defaultCountry);
    const [inputValue, setInputValue] = useState(defaultCountry);

    // 🔹 Fetch countries ONCE
    useEffect(() => {
        fetch("https://aaapis.com/api/v1/info/countries/", {
            headers: {
                Authorization:
                    "Token a79da2a80970f48bedacb7a683f7e1262064db04",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setRawCountries(data.countries || []);
            })
            .catch((err) => console.error(err));
    }, []);

    // 🔹 Memoized country codes
    const COUNTRY_CODES = useMemo(() => {
        return rawCountries
            .filter(
                (c) =>
                    c.phone_international_prefix &&
                    c.country_code &&
                    c.name
            )
            .map((c) => ({
                label: c.country_code,
                value: `+${c.phone_international_prefix}`,
                name: c.name,
            }));
    }, [rawCountries]);

    // 🔹 Sync controlled value
    useEffect(() => {
        if (!value || COUNTRY_CODES.length === 0) return;

        const matched = COUNTRY_CODES.find((c) =>
            value.startsWith(c.value)
        );

        if (matched) {
            setCountryCode(matched.value);
            setInputValue(value);
        }
    }, [value, COUNTRY_CODES]);

    const handleCountryChange = (e) => {
        const newCode = e.target.value;
        const digits = inputValue.replace(countryCode, "");
        const newValue = newCode + digits;

        setCountryCode(newCode);
        setInputValue(newValue);
        setFormData(prev => ({ ...prev, phone: newValue }));
    };

    const handleInputChange = (e) => {
        let val = e.target.value;

        if (!val.startsWith(countryCode)) {
            val = countryCode + val.replace(/\D/g, "");
        }

        const digits = val.slice(countryCode.length).replace(/\D/g, "");
        const finalValue = countryCode + " " + digits;

        setInputValue(finalValue);
        setFormData(prev => ({ ...prev, phone: finalValue }));
    };

    return (
        <div
            className={`flex relative border ${userData?.isPhoneVerified
                ? "border-green-500"
                : "border-red-500"
                } items-center ${className}`}
        >
            {/* Country Select */}
            <CustomSelect
                className="!rounded-r-none !px-4 !border-0 !border-r-2"
                value={countryCode}
                onChange={handleCountryChange}
            >
                {COUNTRY_CODES.map(c => (
                    <option key={`${c.label}-${c.value}`} value={c.value}>
                        <div className="flex items-center gap-2">
                            <img
                                src={`https://flagcdn.com/24x18/${c.label.toLowerCase()}.png`}
                                alt={c.label}
                                width={24}
                                height={16}
                            />
                            <span>
                                {
                                    c.label
                                }
                            </span>
                        </div>
                    </option>
                ))}
            </CustomSelect>

            {/* Phone Input */}
            <input
                type="tel"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="flex-1 !rounded-l-none !border-0 px-2 py-1"
            />

            {/* Verification Icon with Tooltip */}

            <Tooltip onClick={() => navigate('/dashboard/settings')} className={"absolute top-1/2 right-3 -translate-y-1/2 -bg-conic-300 "} text={userData?.isPhoneVerified ? "Phone Number Verified" : "Phone Number is not Verified"}>
                {userData?.isPhoneVerified ? (
                    <Check className="text-green-500" />
                ) : (
                    <IoIosWarning className="text-red-500" />
                )}
            </Tooltip>
        </div>
    );
}

export default PhoneInputField;
