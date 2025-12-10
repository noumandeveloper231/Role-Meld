import { useEffect, useState } from "react";
import assets from "../assets/assets";
import RegisterModel from "../components/RegisterModel";
import VerificationModel from "../components/VerificationModel";
import { useParams } from "react-router-dom";

const Register = () => {
  const search = new URLSearchParams(window.location.search);
  const verification = search.get('verification');

  console.log('verification', verification)
  // Auto Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [])
  const [regStep, setRegStep] = useState(0);

  useEffect(() => {
    verification ? setRegStep(1) : setRegStep(0)
  
  }, [search])
  
  return <>
    <div className="h-screen overflow-hidden w-full flex justify-center items-center">
      <div className="md:w-1/2 py-10 overflow-y-auto">
        {regStep === 0 ? <RegisterModel /> : <VerificationModel />}
      </div>
      <div className="border hidden md:block border-l-3 border-[var(--primary-color)] md:w-1/2">
        <img loading="lazy" src={assets.register_side} alt="Register Side" />
      </div>
    </div>
  </>
};

export default Register;
