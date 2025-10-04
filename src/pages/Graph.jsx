import React, { useState, useCallback } from "react";
function Home() {
  return
  (
    <div>
    lol
    </div>
  );
}
export default Home;
// import ForceGraph2D from "react-force-graph-2d";
//
// const API_URL = "http://localhost:8000";
//
// export default function KnowledgeGraph() {
//   const [graphData, setGraphData] = useState({ nodes: [], links: [] });
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//
//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;
//
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/graph`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           query: searchQuery,
//           top_k: 50  // Get top 50 similar publications
//         })
//       });
//       const data = await response.json();
//       console.log(data);
//       setGraphData(data);
//     } catch (error) {
//       console.error("Error fetching graph:", error);
//       alert("Error fetching graph. Make sure the backend is running.");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSearch();
//     }
//   };
//
//   const handleNodeClick = useCallback((node) => {
//     alert(`Tag: ${node.label}\nAppears in ${node.group} publications`);
//   }, []);
//
//   const handleNodeHover = useCallback((node) => {
//     document.body.style.cursor = node ? "pointer" : "default";
//   }, []);
//
//   return (
//     <div style={{
//       height: "100vh",
//       display: "flex",
//       flexDirection: "column",
//       fontFamily: "system-ui, -apple-system, sans-serif",
//       backgroundColor: "#0a0e27"
//     }}>
//       {/* Search Bar */}
//       <div style={{
//         padding: "20px",
//         backgroundColor: "#141b2d",
//         borderBottom: "1px solid #1f2940"
//       }}>
//         <h1 style={{
//           color: "#fff",
//           fontSize: "24px",
//           marginBottom: "15px",
//           fontWeight: "600"
//         }}>
//           🚀 Space Biology Knowledge Graph
//         </h1>
//
//         <div style={{ display: "flex", gap: "10px", maxWidth: "800px" }}>
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Enter your query (e.g., 'water on Mars', 'plant growth in microgravity')..."
//             style={{
//               flex: 1,
//               padding: "12px 16px",
//               fontSize: "14px",
//               border: "1px solid #1f2940",
//               borderRadius: "8px",
//               backgroundColor: "#1f2940",
//               color: "#fff",
//               outline: "none"
//             }}
//           />
//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             style={{
//               padding: "12px 24px",
//               fontSize: "14px",
//               fontWeight: "600",
//               backgroundColor: "#4a9eff",
//               color: "#fff",
//               border: "none",
//               borderRadius: "8px",
//               cursor: loading ? "not-allowed" : "pointer",
//               opacity: loading ? 0.6 : 1,
//               minWidth: "120px"
//             }}
//           >
//             {loading ? "Loading..." : "Generate Graph"}
//           </button>
//         </div>
//
//         <p style={{
//           color: "#8892b0",
//           fontSize: "13px",
//           marginTop: "10px"
//         }}>
//           Query will be converted to vectors and matched with NASA publications.
//           Graph shows tags from top 50 most similar publications.
//         </p>
//       </div>
//
//       {/* Graph Display */}
//       <div style={{ flex: 1, position: "relative" }}>
//         {graphData.nodes.length === 0 ? (
//           <div style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             height: "100%",
//             flexDirection: "column",
//             color: "#8892b0"
//           }}>
//             <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔍</div>
//             <div style={{ fontSize: "18px", fontWeight: "500" }}>
//               Enter a query to generate knowledge graph
//             </div>
//             <div style={{ fontSize: "14px", marginTop: "8px" }}>
//               The graph will show connections between research topics
//             </div>
//           </div>
//         ) : (
//           <>
//             <div style={{
//               position: "absolute",
//               top: "20px",
//               right: "20px",
//               padding: "12px 16px",
//               backgroundColor: "#141b2d",
//               border: "1px solid #1f2940",
//               borderRadius: "8px",
//               color: "#fff",
//               fontSize: "14px",
//               zIndex: 10
//             }}>
//               <div style={{ fontWeight: "600", marginBottom: "4px" }}>
//                 Graph Stats
//               </div>
//               <div style={{ color: "#8892b0", fontSize: "13px" }}>
//                 {graphData.nodes.length} tags, {graphData.links.length} connections
//               </div>
//             </div>
//
//             <ForceGraph2D
//               graphData={graphData}
//               nodeLabel={node => `${node.label} (${node.group} publications)`}
//               nodeColor={node => {
//                 // Color based on frequency (group value)
//                 if (node.group >= 4) return "#ff6b9d";  // High frequency
//                 if (node.group >= 3) return "#4a9eff";  // Medium-high
//                 if (node.group >= 2) return "#6bcf7f";  // Medium
//                 return "#ffd93d";  // Low frequency
//               }}
//               nodeRelSize={6}
//               nodeVal={node => Math.max(node.group * 3, 8)}  // Size based on frequency
//               linkColor={() => "#2a3f5f"}
//               linkWidth={link => link.weight * 1.5}  // Thicker for stronger connections
//               linkDirectionalParticles={link => link.weight}  // More particles for stronger links
//               linkDirectionalParticleWidth={2}
//               onNodeClick={handleNodeClick}
//               onNodeHover={handleNodeHover}
//               backgroundColor="#0a0e27"
//               nodeCanvasObject={(node, ctx, globalScale) => {
//                 const label = node.label;
//                 const fontSize = 12 / globalScale;
//                 const nodeSize = Math.max(node.group * 2, 5);
//
//                 // Draw node circle
//                 ctx.beginPath();
//                 ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
//
//                 // Color based on frequency
//                 if (node.group >= 4) ctx.fillStyle = "#ff6b9d";
//                 else if (node.group >= 3) ctx.fillStyle = "#4a9eff";
//                 else if (node.group >= 2) ctx.fillStyle = "#6bcf7f";
//                 else ctx.fillStyle = "#ffd93d";
//
//                 ctx.fill();
//                 ctx.strokeStyle = "#fff";
//                 ctx.lineWidth = 2 / globalScale;
//                 ctx.stroke();
//
//                 // Draw label with background
//                 ctx.font = `${fontSize}px Sans-Serif`;
//                 const textWidth = ctx.measureText(label).width;
//                 const padding = 4;
//
//                 // Label background
//                 ctx.fillStyle = "rgba(20, 27, 45, 0.9)";
//                 ctx.fillRect(
//                   node.x - textWidth / 2 - padding,
//                   node.y + nodeSize + 4,
//                   textWidth + padding * 2,
//                   fontSize + padding * 2
//                 );
//
//                 // Label text
//                 ctx.textAlign = "center";
//                 ctx.textBaseline = "middle";
//                 ctx.fillStyle = "#fff";
//                 ctx.fillText(label, node.x, node.y + nodeSize + fontSize / 2 + 8);
//               }}
//               cooldownTicks={100}
//               d3VelocityDecay={0.3}
//             />
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
