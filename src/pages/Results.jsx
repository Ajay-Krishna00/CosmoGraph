import { useState } from "react";
import { Search } from "lucide-react";

function Results() {
  const [search, setSearch] = useState("");

  const publications = [
    { title: "Microbial Growth in Space", link: "#" },
    { title: "Water Recovery Systems on Mars Missions", link: "#" },
    { title: "Plant Adaptation to Microgravity", link: "#" },
  ];

  const handleSearch = () => {
    console.log("Searching for:", search);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f021f] via-[#1a0533] to-[#26084a] text-gray-100 flex flex-col">
      
      {/* Header */}
<header className="flex items-center justify-center p-6 bg-black/40 shadow-lg backdrop-blur-md">
  <div className="flex items-center w-full max-w-3xl space-x-6">
    
    {/* Logo - retains original shape */}
    <div className="bg-transparent p-1">
      <img
        src="/logo.png"
        alt="Logo"
        className="h-14 object-contain drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]"
      />
    </div>

    {/* Search Bar */}
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


      {/* Main Content */}
      <main className="flex flex-1 p-8 gap-8">
        
        {/* Publications list */}
        <aside className="w-1/4 bg-[#1b1033]/70 p-5 rounded-2xl shadow-lg border border-violet-700/40">
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
        </aside>

        {/* Knowledge Graph placeholder */}
        <section className="flex-1 bg-[#1b1033]/70 rounded-2xl shadow-lg border border-violet-700/40 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-violet-200 mb-4">
            Knowledge Graph
          </h2>
          <div className="w-full h-80 border border-violet-700/30 rounded-xl flex items-center justify-center text-gray-400">
            (Graph visualization will appear here)
          </div>
        </section>

        {/* Summary section */}
        <aside className="w-1/4 bg-[#1b1033]/70 p-5 rounded-2xl shadow-lg border border-violet-700/40 flex flex-col">
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
          <p className="text-gray-300 leading-relaxed mb-4">
            October 4th, 2025
          </p>

          <h2 className="text-lg font-semibold text-violet-300 mb-4 border-b border-violet-700/30 pb-2">
            Summary
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Summary of the selected publication will be displayed here once summarization is implemented.
          </p>

          <button
            onClick={handleSearch}
            className="mt-auto bg-violet-500 hover:bg-violet-400 text-white font-bold py-2 px-4 border border-violet-600 rounded"
          >
            View article
          </button>
        </aside>
      </main>
    </div>
  );
}

export default Results;
