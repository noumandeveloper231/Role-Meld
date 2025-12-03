import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, MapPin, X } from 'lucide-react';
import locationService from '../services/locationService';

const SearchableSelect = ({
  label,
  value,
  onChange,
  onInputChange,
  options,
  loading,
  placeholder,
  disabled,
  renderOption,
  keyExtractor,
  displayValue,
  inputValue
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onChange(item);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="flex text-sm items-center gap-2 font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) {
                handleClear();
              }
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-3 py-2.5 pr-20 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg transition-colors disabled:bg-gray-100"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {inputValue && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {showDropdown && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : options.length > 0 ? (
              options.map((item, index) => (
                <div
                  key={keyExtractor(item, index)}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                >
                  {renderOption(item)}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                {inputValue ? 'No results found' : 'Start typing to search'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const LocationSelector = ({
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange,
  disabled = false
}) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryQuery, setCountryQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadCities(selectedCountry);
    } else {
      setCities([]);
      onCityChange('');
    }
  }, [selectedCountry]);

  // Sync queries with selected values if they change externally (or initially)
  useEffect(() => {
    if (selectedCountry && selectedCountry !== countryQuery) {
      setCountryQuery(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCity && selectedCity !== cityQuery) {
      setCityQuery(selectedCity);
    }
  }, [selectedCity]);


  const loadCountries = async () => {
    try {
      setLoading(true);
      const countriesData = await locationService.getCountries();
      setCountries(countriesData);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (countryName) => {
    try {
      setCityLoading(true);
      const citiesData = await locationService.getCitiesForCountry(countryName);
      setCities(citiesData);
    } catch (error) {
      console.error('Failed to load cities:', error);
      setCities([]);
    } finally {
      setCityLoading(false);
    }
  };

  const filteredCountries = countries.length > 0
    ? locationService.searchCountries(countryQuery).slice(0, 10)
    : [];
  const filteredCities = cities.length > 0
    ? locationService.searchCities(cities, cityQuery).slice(0, 10)
    : [];

  const handleCountrySelect = (country) => {
    if (country) {
      onCountryChange(country.name);
      setCountryQuery(country.name);
      onCityChange(''); // Reset city when country changes
      setCityQuery('');
    } else {
      onCountryChange('');
      setCountryQuery('');
      onCityChange('');
      setCityQuery('');
    }
  };

  const handleCitySelect = (city) => {
    if (city) {
      onCityChange(city);
      setCityQuery(city);
    } else {
      onCityChange('');
      setCityQuery('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SearchableSelect
        label="Country"
        inputValue={countryQuery}
        onInputChange={setCountryQuery}
        onChange={handleCountrySelect}
        options={filteredCountries}
        loading={loading}
        placeholder="Search for a country..."
        disabled={disabled || loading}
        keyExtractor={(item) => item.iso2}
        renderOption={(country) => (
          <div className="flex items-center justify-between">
            <span className="font-medium">{country.name}</span>
            <span className="text-xs text-gray-500">{country.iso2}</span>
          </div>
        )}
      />

      <SearchableSelect
        label="City"
        inputValue={cityQuery}
        onInputChange={setCityQuery}
        onChange={handleCitySelect}
        options={filteredCities}
        loading={cityLoading}
        placeholder={selectedCountry ? "Search for a city..." : "Select a country first"}
        disabled={disabled || !selectedCountry || cityLoading}
        keyExtractor={(item, index) => index}
        renderOption={(city) => city}
      />
    </div>
  );
};

export default LocationSelector;
