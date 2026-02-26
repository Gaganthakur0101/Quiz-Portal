import Prism from "./components/Prism";
import Navbar from "./components/NavAuth";
import Footer from "./components/Footer";
import { useNavigate } from 'react-router-dom';

function Home() {
  
  const attributes = {
    animationType: "rotate",
    timeScale: 0.5,
    height: 3.5,
    baseWidth: 5.5,
    scale: 3.6,
    hueShift: 0,
    colorFrequency: 1,
    noise: 0.0,
    glow: 1,
  };
  const navigate = useNavigate();

  return (
    <>
      <div className="h-screen w-screen relative flex  flex-col justify-center items-center gap-16 p-10">
        <Navbar />
        <div className="w-full h-full absolute -z-10 sm:flex hidden">
          <Prism {...attributes} />
        </div>

        <h3 className="bricolage font-medium text-3xl md:text-5xl w-full md:w-3/5 md:text-wrap text-balance text-center">
          A Quiz platform to test knowledge, track progress, and compete via
          leaderboards and multiplayer challenges.
        </h3>
        <div className="flex justify-evenly w-85">
          <button className="bg-white text-black rounded-full font-medium px-8 py-2 hover:opacity-90 hover:scale-105 transition-all duration-200 transform" onClick={() => navigate('/signup')}>
            Get Started
          </button>
          <button className="py-3 px-8  bg-none border-2  text-white rounded-full font-medium hover:opacity-90 hover:scale-105 transition-all duration-200 transform">
            Learn More
          </button>
        </div>

      </div>
      <Footer />
    </>
  );
}

export default Home;
