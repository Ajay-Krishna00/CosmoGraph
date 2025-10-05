import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const commonTerms = [
    "Mars",
    "Microgravity",
    "Plants",
    "Microbes",
    "Plant growth",
  ];

  const openPageResults = () => {
    /*accessDB();*/
    navigate("/results", { state: { query: search } });
  };

  const openPageResultsQuery = (query) => {
    /*accessDB();*/
    navigate("/results", { state: { query: query } });
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      openPageResults();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900/80 via-violet-800/60 to-black/90 flex flex-col items-center justify-center p-6">
      {/* Logo + App Name */}
      <div className="flex flex-col items-center mb-12">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4" />
        <h1 className="text-5xl font-extrabold text-violet-400 mb-1 tracking-wide">
          CosmoGraph
        </h1>
        <p className="text-violet-200 text-lg">
          Explore NASA bioscience publications
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex w-full max-w-lg shadow-2xl rounded-lg overflow-hidden">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Try: Effects of zero gravity on muscle mass"
          className="flex-grow p-4 bg-violet-900/50 text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={openPageResults}
          className="bg-violet-400 text-white px-6 font-semibold rounded-r-lg transition-colors hover:bg-violet-500"
        >
          Search
        </button>
      </div>

      {/* Common Terms */}
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
  );
}

export default Home