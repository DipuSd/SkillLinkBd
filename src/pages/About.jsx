import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaBoltLightning } from "react-icons/fa6";

function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 py-16 px-6 sm:px-12 lg:px-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About SkillMatch
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Connecting local talent with opportunities across Bangladesh through
            smart, data-driven matching.
          </p>
        </div>

        {/* Mission Section */}
        <div className="py-16 px-6 sm:px-12 lg:px-24 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-teal-100 p-4 rounded-full mb-6">
              <FaBoltLightning size={40} className="text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              SkillMatch is dedicated to bridging the gap between skilled workers
              and those who need their services. We believe in dignity of labor,
              fair wages, and the power of technology to create economic
              opportunities for everyone in our community.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Whether you need a plumber, an electrician, a tutor, or household
              help, SkillMatch provides a reliable platform to find verified
              professionals quickly and safely.
            </p>
          </div>
        </div>

        {/* Stats Section (Mock) */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">5K+</h3>
              <p className="text-gray-500 font-medium">Active Workers</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-4xl font-bold text-teal-600 mb-2">12K+</h3>
              <p className="text-gray-500 font-medium">Jobs Completed</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-4xl font-bold text-indigo-600 mb-2">98%</h3>
              <p className="text-gray-500 font-medium">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default About;
