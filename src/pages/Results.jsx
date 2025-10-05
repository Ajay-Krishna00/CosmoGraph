import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { Search } from "lucide-react";

import ForceGraph2D from "react-force-graph-2d";
const API_URL = "http://localhost:8000";

function Results() {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPublications, setShowPublications] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);

  const [fetchedPublications, setFetchedPublications] = useState([]);
  const [selectedPublication, setSelectedPublication] = useState(null);

  const [summary, setSummary] = useState("Summary of the selected publication will be displayed here once summarization is implemented.");

  const location = useLocation();
  const { query } = location.state || {};

  const navigate = useNavigate();

  const handleViewPaper = () => {
    /*accessDB();*/
    navigate("/paper");
  };

  

  const togglePublications = () => {
    setShowPublications(!showPublications);
  };

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  // New Handler Function
  const handleSelectPublication = (publication) => {
    // This function will eventually fetch the full details/summary 
    // for the publication if needed, but for now, we use the retrieved data.
    setSelectedPublication(publication);
    setShowSummary(true); // Ensure the summary panel is visible
  };

  const panelBaseClasses =
    "fixed top-20 bottom-20 bg-[#1b1033]/90 p-5 rounded-2xl shadow-lg border border-violet-700/40 z-30 flex flex-col overflow-y-auto transition-all duration-300";

  {/*Graph stuff*/}
  useEffect(() => {
  setSearchQuery(query);
  setSearch(query);

  const handleSearch2 = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setFetchedPublications([]);
    setSelectedPublication(null);

    try {
      const response = await fetch(`${API_URL}/graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          top_k: 50
        })
      });
      const data = await response.json();
      console.log(data);
      const { nodes, links, publications } = data;

      const summ=await fetch(`${API_URL}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          top_k: 50
        })
      });
      const summaryData = await summ.json();
      setSummary(summaryData);

      setGraphData({ nodes, links });

      // ✅ Deduplicate publications by ID or title
      const uniquePubs = publications.filter(
        (pub, index, self) =>
          index === self.findIndex(
            (p) => p.id === pub.id || p.title === pub.title
          )
      );

      setFetchedPublications(uniquePubs); 
      setShowPublications(true);

      if (uniquePubs.length > 0) {
        handleSelectPublication(uniquePubs[0]);
      } else {
        setSelectedPublication(null);
      }

    } catch (error) {
      console.error("Error fetching graph:", error);
      alert("Error fetching graph. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  handleSearch2();
}, []);


  {/*
  const assignRandomColors = (data) => {
    data.nodes.forEach(node => {
      node.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    });
    return data;
  };

  const dummyData = {
    nodes: [
      { id: "node_0", name: "Node 0", val: 10 },
      { id: "node_1", name: "Node 1", val: 8 },
      { id: "node_2", name: "Node 2", val: 6 },
      { id: "node_3", name: "Node 3", val: 9 },
      { id: "node_4", name: "Node 4", val: 7 },
      { id: "node_5", name: "Node 5", val: 5 },
      { id: "node_6", name: "Node 6", val: 10 },
      { id: "node_7", name: "Node 7", val: 4 },
      { id: "node_8", name: "Node 8", val: 3 },
      { id: "node_9", name: "Node 9", val: 2 }
    ],
    links: [
      { source: "node_0", target: "node_1" },
      { source: "node_0", target: "node_2" },
      { source: "node_1", target: "node_3" },
      { source: "node_1", target: "node_4" },
      { source: "node_2", target: "node_5" },
      { source: "node_3", target: "node_6" },
      { source: "node_4", target: "node_7" },
      { source: "node_5", target: "node_8" },
      { source: "node_6", target: "node_9" },
      { source: "node_7", target: "node_8" }
    ]
  };

  const coloredData = assignRandomColors(dummyData);
  */}

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          top_k: 50  // Get top 50 similar publications
        })
      });
      const data = await response.json();
      console.log(data);
      setGraphData(data);
    } catch (error) {
      console.error("Error fetching graph:", error);
      alert("Error fetching graph. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNodeClick = useCallback((node) => {
    alert(`Tag: ${node.label}\nAppears in ${node.group} publications`);
  }, []);

  const handleNodeHover = useCallback((node) => {
    document.body.style.cursor = node ? "pointer" : "default";
  }, []);

  return (
    <div>

      {/* Floating Search Bar Overlay */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 flex justify-center">
        <div className="max-w-3xl w-full flex items-center rounded-full overflow-hidden shadow-lg border border-violet-700/40">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={handleKeyPress}
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

      <div className="min-h-screen bg-gradient-to-br from-[#0f021f] via-[#1a0533] to-[#26084a] text-gray-100 flex flex-col relative">

      {/* Left arrow tab */}
      {!showPublications && (
        <button
          onClick={togglePublications}
          className="fixed top-1/2 left-0 z-40 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-r-full shadow-lg w-8 h-14 flex items-center justify-center cursor-pointer transform -translate-y-1/2"
          aria-label="Expand Publications Panel"
          title="Show Publications"
        >
          <span className="block w-4 h-4 border-t-2 border-r-2 border-white transform rotate-45" />
        </button>
      )}

      {/* Right arrow tab */}
      {!showSummary && (
        <button
          onClick={toggleSummary}
          className="fixed top-1/2 right-0 z-40 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-l-full shadow-lg w-8 h-14 flex items-center justify-center cursor-pointer transform -translate-y-1/2"
          aria-label="Expand Summary Panel"
          title="Show Summary"
        >
          <span className="block w-4 h-4 border-t-2 border-l-2 border-white transform -rotate-45" />
        </button>
      )}

      {/* Publications Panel */}
      <aside
        className={`fixed top-20 bottom-20 left-6 z-30 flex flex-col overflow-y-auto transition-all duration-300 ${
          showPublications
            ? "w-100 p-5"
            : "w-0 p-0 bg-transparent border-0 shadow-none"
        } ${showPublications ? panelBaseClasses : ""}`}
        style={{ overflow: showPublications ? "auto" : "hidden" }}
      >
{showPublications && (
          <>
            <h2 className="text-lg font-semibold text-violet-300 mb-4 border-b border-violet-700/30 pb-2">
              Publications ({fetchedPublications.length})
            </h2>
            {loading && <p className="text-gray-400">Loading publications...</p>}
            {!loading && fetchedPublications.length === 0 && searchQuery.trim() && (
                <p className="text-gray-400">No publications found for the query.</p>
            )}
            {!loading && fetchedPublications.length === 0 && !searchQuery.trim() && (
                <p className="text-gray-400">Enter a search query to find related publications.</p>
            )}
            <ul className="space-y-3 flex-grow overflow-y-auto">
              {fetchedPublications.map((pub, index) => (
                <li 
                  key={pub.id || index}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedPublication && selectedPublication.id === pub.id 
                          ? 'bg-violet-700/60 border border-violet-500' 
                          : 'hover:bg-violet-800/40'
                  }`}
                  onClick={() => handleSelectPublication(pub)} // Use the new handler
                >
                  <span
                    className="block text-gray-300 hover:text-violet-300"
                  >
                    {pub.title}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={togglePublications}
              className="mt-4 bg-violet-500 hover:bg-violet-400 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </>
        )}
      </aside>

      {/* Summary Panel */}
      
    <aside
  className={`fixed top-20 bottom-20 right-6 z-30 flex flex-col overflow-y-auto transition-all duration-300 ${
    showSummary
      ? "w-100 p-5"
      : "w-0 p-0 bg-transparent border-0 shadow-none"
  } ${showSummary ? panelBaseClasses : ""}`}
  style={{ overflow: showSummary ? "auto" : "hidden" }}
>
  {showSummary && selectedPublication && (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <h2 className="text-lg font-semibold text-violet-300 mb-4 border-b border-violet-700/30 pb-2">
          Summary
        </h2>
        <p className="text-gray-300 leading-relaxed">
          {summary ||
            "Summary of the selected publication will be displayed here once summarization is implemented."}
        </p>
      </div>

      {/* Close button fixed at bottom */}
      <button
        onClick={toggleSummary}
        className="mt-auto bg-violet-500 hover:bg-violet-400 text-white font-bold py-2 px-4 rounded self-center w-full"
      >
        Close
      </button>
    </div>
  )}
  </aside>




      {/* Knowledge Graph fills entire viewport behind overlays */}
      <section className="fixed inset-0 bg-[#1b1033]/70 rounded-2xl shadow-lg border border-violet-700/40 flex items-center justify-center z-10">
        <div className="w-full h-full border border-violet-700/30 rounded-xl flex items-center justify-center text-gray-400">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel={node => `${node.label} (${node.group} publications)`}
            nodeColor={node => {
              if (node.group >= 4) return "#ff6b9d";
              if (node.group >= 3) return "#4a9eff";
              if (node.group >= 2) return "#6bcf7f";
              return "#ffd93d";
            }}
            nodeRelSize={6}
            nodeVal={node => Math.max(node.group * 3, 8)}
            linkColor={() => "#2a3f5f"}
            linkWidth={link => link.weight * 1.5}
            linkDirectionalParticles={link => link.weight}
            linkDirectionalParticleWidth={2}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            backgroundColor="#0a0e27"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.label;
              const fontSize = 12 / globalScale;
              const nodeSize = Math.max(node.group * 2, 5);

              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);

              if (node.group >= 4) ctx.fillStyle = "#ff6b9d";
              else if (node.group >= 3) ctx.fillStyle = "#4a9eff";
              else if (node.group >= 2) ctx.fillStyle = "#6bcf7f";
              else ctx.fillStyle = "#ffd93d";

              ctx.fill();
              ctx.strokeStyle = "#fff";
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();

              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const padding = 4;

              ctx.fillStyle = "rgba(20, 27, 45, 0.9)";
              ctx.fillRect(
                node.x - textWidth / 2 - padding,
                node.y + nodeSize + 4,
                textWidth + padding * 2,
                fontSize + padding * 2
              );

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#fff";
              ctx.fillText(label, node.x, node.y + nodeSize + fontSize / 2 + 8);
            }}
            cooldownTicks={100}
            d3VelocityDecay={0.3}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </section>


    </div>
    </div>
  );
}

export default Results;
