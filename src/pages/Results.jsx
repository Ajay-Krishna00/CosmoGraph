import { useState } from "react";
import { Search } from "lucide-react";

function Results() {
  const [search, setSearch] = useState("");

  const [showPublications, setShowPublications] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const publications = [
    { title: "Microbial Growth in Space", link: "#" },
    { title: "Water Recovery Systems on Mars Missions", link: "#" },
    { title: "Plant Adaptation to Microgravity", link: "#" },
  ];

  const handleSearch = () => {
    console.log("Searching for:", search);
  };

  const togglePublications = () => {
    setShowPublications(!showPublications);
  };

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  const headerHeight = 72; // approx height of header in px (you can adjust if needed)
  const panelBaseClasses =
    `fixed bg-[#1b1033]/90 p-5 rounded-2xl shadow-lg border border-violet-700/40 z-30 flex flex-col overflow-y-auto transition-all duration-300`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f021f] via-[#1a0533] to-[#26084a] text-gray-100 flex flex-col relative">

      {/* Floating Fixed Header */}
      <header
        style={{ height: headerHeight }}
        className="fixed top-0 left-0 right-0 bg-black/40 shadow-lg backdrop-blur-md z-50 flex items-center justify-center px-6"
      >
        <div className="flex items-center w-full max-w-3xl space-x-6">
          <div className="bg-transparent p-1">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 object-contain drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]"
            />
          </div>
          <div className="flex items-center w-full bg-[#1b1033]/70 rounded-full overflow-hidden shadow-lg border border-violet-700/40">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search publications..."
              className="flex-grow p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {!showPublications && (
        <button
          onClick={togglePublications}
          className="fixed top-1/2 left-0 z-40 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-r-full shadow-lg w-8 h-14 flex items-center justify-center cursor-pointer transform -translate-y-1/2"
          aria-label="Expand Publications Panel"
          title="Show Publications"
          style={{ top: `calc(50% + ${headerHeight / 2}px)` }}
        >
          <span className="block w-4 h-4 border-t-2 border-r-2 border-white transform rotate-45" />
        </button>
      )}

      {!showSummary && (
        <button
          onClick={toggleSummary}
          className="fixed top-1/2 right-0 z-40 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-l-full shadow-lg w-8 h-14 flex items-center justify-center cursor-pointer transform -translate-y-1/2"
          aria-label="Expand Summary Panel"
          title="Show Summary"
          style={{ top: `calc(50% + ${headerHeight / 2}px)` }}
        >
          <span className="block w-4 h-4 border-t-2 border-l-2 border-white transform -rotate-45" />
        </button>
      )}

      <aside
        className={`fixed left-0 z-30 flex flex-col overflow-y-auto transition-all duration-300 ${
          showPublications
            ? "w-72 p-5"
            : "w-0 p-0 bg-transparent border-0 shadow-none"
        } ${showPublications ? panelBaseClasses : ""}`}
        style={{
          overflow: showPublications ? "auto" : "hidden",
          top: headerHeight,
          bottom: 0,
        }}
      >
        {showPublications && (
          <>
            <h2 className="text-lg font-semibold text-violet-300 mb-4 border-b border-violet-700/30 pb-2">
              Publications
            </h2>
            <ul className="space-y-3">
              {publications.map((pub, index) => (
                <li key={index}>
                  <a
                    href={pub.link}
                    className="block text-gray-300 hover:text-violet-300 transition"
                  >
                    {pub.title}
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={togglePublications}
              className="mt-auto bg-violet-500 hover:bg-violet-400 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </>
        )}
      </aside>

      <aside
        className={`fixed right-0 z-30 flex flex-col overflow-y-auto transition-all duration-300 ${
          showSummary
            ? "w-80 p-5"
            : "w-0 p-0 bg-transparent border-0 shadow-none"
        } ${showSummary ? panelBaseClasses : ""}`}
        style={{
          overflow: showSummary ? "auto" : "hidden",
          top: headerHeight,
          bottom: 0,
        }}
      >
        {showSummary && (
          <>
            <h2 className="text-lg font-semibold text-violet-300 mb-4 border-b border-violet-700/30 pb-2">
              Title
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              How to kill a mockingbird
            </p>

            <h2 className="text-lg font-semibold text-violet-300 mb-4 border-b border-violet-700/30 pb-2">
              Authors
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Albert Einstein, Thaariq Haasan, Issac Newton, Ajay Krishna
            </p>

            <h2 className="text-lg font-semibold text-violet-300 mb-4 border-b border-violet-700/30 pb-2">
              Published on
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">October 4th, 2025</p>

            <h2 className="text-lg font-semibold text-violet-300 mb-4 border-b border-violet-700/30 pb-2">
              Summary
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Summary of the selected publication will be displayed here once
              summarization is implemented.
            </p>

            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleSearch}
                className="flex-1 bg-violet-500 hover:bg-violet-400 text-white font-bold py-2 px-4 border border-violet-600 rounded"
              >
                View article
              </button>
              <button
                onClick={toggleSummary}
                className="flex-1 bg-violet-500 hover:bg-violet-400 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Knowledge graph fills entire available area below fixed header with no margins */}
      <section
        style={{ top: headerHeight, bottom: 0, left: 0, right: 0 }}
        className="fixed bg-[#1b1033]/90 shadow-lg border border-violet-700/40 flex flex-col items-center justify-center z-10"
      >
        <h2 className="text-xl font-semibold text-violet-200 mb-4">Knowledge Graph</h2>
        <div className="flex-1 w-full border border-violet-700/30 flex items-center justify-center text-gray-400">
          (Graph visualization will appear here)
        </div>
      </section>
    </div>
  );
}

export default Results;
