import Navbar from "../components/Navbar";
import { BsStars } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { HiOutlineBolt } from "react-icons/hi2";
import { FiTarget } from "react-icons/fi";
import { IoMdRibbon } from "react-icons/io";
import { MdElectricalServices } from "react-icons/md";
import { BsWrenchAdjustable } from "react-icons/bs";
import { FaBookOpen } from "react-icons/fa";
import { FaHammer } from "react-icons/fa6";
import { HiScissors } from "react-icons/hi2";
import { GiBroom } from "react-icons/gi";
import { GiCook } from "react-icons/gi";
import { TbAirConditioningDisabled } from "react-icons/tb";
import { IoShieldOutline } from "react-icons/io5";
import { MdPersonOutline } from "react-icons/md";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <>
      <Navbar />
      {/* Info section */}
      <div className="min-w-screen bg-gradient-to-r from-blue-500 to-teal-500 flex flex-row px-5 py-10 space-x-2">
        <div className="flex flex-col">
          <div className="text-white flex flex-row items-center space-x-2 justify-center font-semibold rounded-lg bg-white/30 px-2 w-60">
            <BsStars size={20} />
            <p>Smart job matching</p>
          </div>
          <div>
            <h1 className="font-semibold text-white text-[40px]">
              Find or Offer Local Jobs Easily
            </h1>
            <p className="text-white text-xl">
              Connect with skilled workers in your neighborhood or find local
              opportunities using intelligent, rule-based matching.
            </p>
          </div>
          {/* buttons */}
          <div className="flex flex-row space-x-4 py-4">
            <button className="bg-white py-1 px-3 rounded-lg font-semibold text-blue-400 flex flex-row items-center justify-center space-x-2 cursor-pointer hover:opacity-70">
              <p>I need work</p>
              <FaArrowRight />
            </button>
            <button className="bg-white py-1 px-3 rounded-lg font-semibold text-blue-400 border border-white flex flex-row items-center justify-center space-x-2 hover:bg-transparent hover:text-white cursor-pointer">
              <p>I need help</p>
              <FaArrowRight />
            </button>
          </div>
          {/* metrics info */}
          <div className="flex flex-row items-center space-x-10">
            <div className="text-white">
              <h2 className="text-[35px]">5K+</h2>
              <p className="text-sm">Active Worker</p>
            </div>
            <div className="text-white">
              <h2 className="text-[35px]">12k+</h2>
              <p className="text-sm">Jobs Completed</p>
            </div>
            <div className="text-white">
              <span className="flex flex-row items-center space-x-1">
                <h2 className="text-[35px]">4.8</h2>
                <FaStar size={35} />
              </span>
              <p className="text-sm">Average Rating</p>
            </div>
          </div>
        </div>
        {/* image container */}
        <div className="flex-1">
          <img
            className="rounded-lg min-w-110"
            src="homepage1.jpeg"
            alt="group of people looking at a laptop"
          />
          <div className="flex flex-row items-center bg-white rounded-xl p-2 space-x-3 w-30 relative bottom-10 right-10">
            <div className="p-1 rounded-full bg-teal-400 text-white">
              <HiOutlineBolt size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Match quality</p>
              <h2 className="text-xl">94%</h2>
            </div>
          </div>
        </div>
      </div>
      {/* how it works section */}
      <div className="flex flex-col justify-center items-center py-2">
        <h2 className="font-bold text-lg">How It Works</h2>
        <p className="text-gray-400 text-xl">
          Get started in three simple steps and connect with opportunities
        </p>
        {/* card holders */}
        <div className="flex flex-row mt-10 space-x-5 mx-2 max-w-300">
          <div className="flex flex-col items-center justify-center border-3 border-gray-300 rounded-xl p-2 hover:border-blue-300 cursor-pointer hover:shadow-lg transition-all duration-200">
            <div className="bg-blue-400 p-2 rounded-full text-white mb-2">
              <IoPersonSharp size={45} />
            </div>
            <p className="text-md">1.Create Profile</p>
            <p className="text-xl text-gray-500">
              Sign up as a service provider or client. Add your skills or job
              requirements.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border-3 border-gray-300 rounded-xl p-2 hover:border-r-teal-300 hover:border-l-blue-300 hover:border-t-blue-300 hover:border-b-teal-300 cursor-pointer hover:shadow-lg transition-all duration-200">
            <div className="bg-gradient-to-r from-blue-400 to-teal-400 p-2 rounded-full text-white mb-2">
              <FiTarget size={45} />
            </div>
            <p className="text-md">2.Get Matched</p>
            <p className="text-xl text-gray-500">
              Our matching engine pairs you with relevant jobs or skilled workers
              nearby.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border-3 border-gray-300 rounded-xl p-2 hover:border-teal-400 cursor-pointer hover:shadow-lg transition-all duration-200">
            <div className="bg-teal-400 p-2 rounded-full text-white mb-2">
              <IoMdRibbon size={45} />
            </div>
            <p className="text-md">3.Earn or Hire</p>
            <p className="text-xl text-gray-500">
              Complete jobs, earn money, or hire reliable workers. Rate and
              review each other.
            </p>
          </div>
        </div>
      </div>
      {/* top local skills section
       */}
      <div className="flex flex-col items-center justify-center mt-5">
        <h2 className="font-bold text-lg">Top Local Skills</h2>
        <p className="text-gray-400 text-xl">
          Browse Popular Categories and Find the Right service
        </p>
        <div className="grid grid-cols-4 gap-4 mt-5 mb-5">
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-10 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <MdElectricalServices size={45} color="orange" />
            <p className="font-semibold">Electrician</p>
            <p className="text-gray-400 text-sm">128</p>
          </div>
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-10 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <BsWrenchAdjustable size={45} color="darkred" />
            <p className="font-semibold">Plumber</p>
            <p className="text-gray-400 text-sm">28</p>
          </div>
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-10 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <FaBookOpen size={45} color="gray" />
            <p className="font-semibold">Tutor</p>
            <p className="text-gray-400 text-sm">12</p>
          </div>
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-10 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <FaHammer size={45} color="Teal" />
            <p className="font-semibold">Carpenter</p>
            <p className="text-gray-400 text-sm">50</p>
          </div>
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-10 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <HiScissors size={45} color="blue" />
            <p className="font-semibold">Tailor</p>
            <p className="text-gray-400 text-sm">128</p>
          </div>
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-10 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <GiBroom size={45} color="indigo" />
            <p className="font-semibold">Cleaner</p>
            <p className="text-gray-400 text-sm">128</p>
          </div>
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-10 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <GiCook size={45} color="green" />
            <p className="font-semibold">Cook</p>
            <p className="text-gray-400 text-sm">128</p>
          </div>
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-10 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <TbAirConditioningDisabled size={45} />
            <p className="font-semibold">Ac Repair Man</p>
            <p className="text-gray-400 text-sm">128</p>
          </div>
        </div>
      </div>
      {/* Recommendation section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 flex flex-row p-4 lg:px-80 space-x-5 justify-between">
        {/* left col */}
        <div className="flex flex-col flex-1">
          <div className="flex flex-row space-x-2 bg-white/30 rounded-lg text-white px-2 w-40">
            <BsStars size={24} />
            <p>Data-driven tips</p>
          </div>
          <h2 className="text-white text-lg mt-2">Smart Technology</h2>
          <p className="text-white text-xl">
            Our rules-based engine analyzes your skills, location, availability,
            and preferences to recommend the most relevant opportunities. No more
            endless scrolling!
          </p>
          <div className="flex flex-col mt-5 space-y-2">
            <div className="flex flex-row text-white space-x-4 items-center">
              <IoShieldOutline size={35} />
              <p>Verified profile</p>
            </div>
            <div className="flex flex-row text-white space-x-4 items-center">
              <MdPersonOutline size={35} />
              <p>Community Driven reviews and rating</p>
            </div>
          </div>
        </div>
        {/* right col */}
        <div className="bg-white/30 rounded-lg flex flex-col flex-1 p-4 space-y-5 max-w-110">
          {/* boxes */}
          <div className="bg-white rounded-md p-2 space-y-5">
            <div className="flex flex-row justify-between">
              <p className="text-gray-400">Match Score</p>
              <p className="text-teal-500">94%</p>
            </div>
            {/* bar */}
            <div className="bg-gray-300 w-full rounded-lg">
              <div className="w-94 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg"></div>
            </div>
          </div>
          <div className="bg-white rounded-md p-2 space-y-5">
            <div className="flex flex-row justify-between">
              <p className="text-gray-400">Average Response</p>
              <p className="text-blue-500">2.5 Hour</p>
            </div>
            <div className="bg-gray-300 w-full rounded-lg">
              <div className="w-88 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg"></div>
            </div>
          </div>
          <div className="bg-white rounded-md p-2 space-y-5">
            <div className="flex flex-row justify-between">
              <p className="text-gray-400">Success Rate</p>
              <p className="text-teal-300">89%</p>
            </div>
            <div className="bg-gray-300 w-full rounded-lg">
              <div className="w-89 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
      {/* footer */}
      <Footer />
    </>
  );
}
export default HomePage;
