import { FaBoltLightning } from "react-icons/fa6";
import { LuCopyright } from "react-icons/lu";

function Footer() {
  const getYear = () => {
    return new Date().getFullYear();
  };

  return (
    <>
      <footer className="bg-gray-800 p-4">
        {/* logo */}
        <div className="flex flex-row items-center space-x-2 cursor-pointer">
          <div className="bg-teal-500 rounded-md p-1 text-orange-300">
            <FaBoltLightning size={24} />
          </div>
          <p className="font-bold text-xl text-teal-500">SkillMatch</p>
        </div>
        {/* text */}
        <p className=" text-gray-600  mt-2">
          Connecting local talent with opportunities across Bangladesh
        </p>
        {/* quick link section */}
        <div className="space-y-2 flex flex-col">
          <h2 className="text-white mt-5">Quick Links</h2>
          <a href="#" className="text-gray-500 hover:text-white">
            About
          </a>
          <a href="#" className="text-gray-500 hover:text-white">
            Contact
          </a>
          <a href="#" className="text-gray-500 hover:text-white">
            Login
          </a>
          <a href="#" className="text-gray-500 hover:text-white">
            Register
          </a>
        </div>
        {/* for worker section */}
        <div className="space-y-2 flex flex-col">
          <h2 className="text-white mt-5">For Workers</h2>
          <a href="#" className="text-gray-500 hover:text-white">
            Find Jobs
          </a>
          <a href="#" className="text-gray-500 hover:text-white">
            How it works
          </a>
          <a href="#" className="text-gray-500 hover:text-white">
            Success Stories
          </a>
        </div>
        {/* copyright section */}
        <hr className="text-gray-400 mt-5" />
        <div className="flex justify-center items-center p-4">
          <div className="flex flex-row space-x-2 items-center text-white">
            <LuCopyright size={35} />
            <p>{getYear()} SkillMatch. All rights reserved</p>
          </div>
        </div>
      </footer>
    </>
  );
}
export default Footer;
