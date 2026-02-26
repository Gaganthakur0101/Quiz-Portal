import { useNavigate } from "react-router-dom";

const Navbar = ({ isRequired = true }) => {
  const navigate = useNavigate();

  const handleLogin = () => navigate("/login");
  const handleLogoClick = () => navigate("/");

  return (
    <nav
      className="fixed top-4 md:top-10 left-1/2 z-50 w-9/10  max-w-6xl opacity-80 border-white/10 border-2 bg-black/20 backdrop-blur-lg text-white flex justify-between items-center px-6 sm:px-12 py-4 sm:py-4 
      rounded-full shadow-lg transform -translate-x-1/2"
      role="navigation"
      aria-label="Main navigation"
    >
      <button
        onClick={handleLogoClick}
        className=" text-xl bricolage sm:text-2xl font-bold cursor-pointer hover:text-gray-200 transition-colors focus:outline-none rounded"
        aria-label="Navigate to home page"
      >
        Quizzy
      </button>
      <div className="flex items-center space-x-2 sm:space-x-4">
        {isRequired && <Button onClick={handleLogin} />}
      </div>
    </nav>
  );
};

const Button = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="py-2 px-4 sm:px-8 border-2 border-white text-black bg-white rounded-full font-medium text-sm sm:text-base 
      hover:bg-transparent hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none"
      aria-label="Login to your account"
    >
      Login
    </button>
  );
};

export default Navbar;
