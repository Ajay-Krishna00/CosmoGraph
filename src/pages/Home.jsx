import { useState } from "react";
import { useNavigate } from "react-router";
import { Particles } from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useMemo } from "react";
import axios from "axios";

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [init, setInit] = useState(false);

  const commonTerms = ["Mars", "Microgravity", "Plants", "Microbes", "Plant growth"];

  useEffect(() => {
  initParticlesEngine(async (engine) => {
    await loadSlim(engine);
  })
    .then(() => {
      console.log("Particles engine initialized");
      setInit(true);
    })
    .catch((err) => console.error("Particle init failed:", err));
}, []);

  const particlesOptions = useMemo(
    () => ({
      background: { color: { value: "#0a021c" } },
      fpsLimit: 100,
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" }, resize: true },
        modes: { repulse: { distance: 80, duration: 0.3 } },
      },
      particles: {
        color: { value: "#a78bfa" },
        links: {
          color: "#8b5cf6",
          distance: 90,
          enable: true,
          opacity: 0.7,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.7,
          direction: "none",
          outModes: { default: "out" },
        },
        number: { value: 180, density: { enable: true, area: 800 } },
        opacity: { value: 0.9 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    }),
    []
  );

  const openPageResults = () => navigate("/results", { state: { query: search } });
  const openPageResultsQuery = (query) => navigate("/results", { state: { query } });

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      openPageResults();
    }
  };

  return (
  <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-[#0a021c]">
    {init && (
      <Particles 
        id="tsparticles" 
        options={particlesOptions} 
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      />
    )}
        {/* UI */}
        <div className="relative z-10 w-full max-w-4xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-2" />
          <h1 className="text-5xl font-extrabold text-violet-400 mb-1 tracking-wide">
            CosmoGraph
          </h1>
          <p className="text-violet-200 text-lg">Explore NASA bioscience publications</p>
        </div>

        <div className="flex w-full max-w-2xl shadow-xl mx-auto rounded-lg overflow-hidden">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Try: Effect of microgravity on plant growth"
            className="flex-grow p-4 bg-violet-900/50 text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={openPageResults}
            className="bg-violet-700 text-violet-300 px-6 font-semibold rounded-r-lg transition-colors hover:bg-violet-500"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap justify-center mt-6 gap-2">
          {commonTerms.map((term) => (
            <button
              key={term}
              onClick={() => openPageResultsQuery(term)}
              className="text-violet-300 hover:bg-violet-500 text-sm px-3 py-1 border border-violet-500 rounded-full"
            >
              {term}
            </button>
          ))}
        </div>
      
        </div>
  </div>
  );
}

export default Home