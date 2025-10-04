import React, { useRef, useState } from "react";

const paper = {
  title: "Understanding Quantum Entanglement in Photonic Systems",
  authors: [
    "Dr. Alice Johnson",
    "Prof. Bob Smith",
    "Carol Lee, PhD",
    "David Kumar",
  ],
  content: [
    { id: "abstract", type: "heading1", text: "Abstract" },
    { type: "paragraph", text: "This paper explores the properties of quantum entanglement in photonic systems and its applications in quantum computing and communication." },
    { id: "introduction", type: "heading1", text: "Introduction" },
    { type: "paragraph", text: "Quantum entanglement is a fundamental aspect of quantum mechanics where particles become interconnected regardless of the distance separating them. This work focuses on photonic implementations." },
    { id: "background", type: "heading2", text: "Background and Theory" },
    { type: "paragraph", text: "We review the key theoretical underpinnings of quantum entanglement, including Bell’s theorem and the EPR paradox." },
    { id: "setup", type: "heading2", text: "Experimental Setup" },
    { type: "paragraph", text: "Our experiments use nonlinear crystals to create entangled photon pairs, detected via coincidence counting." },
    { id: "results", type: "heading1", text: "Results and Discussion" },
    { type: "paragraph", text: "The results show high entanglement fidelity and demonstrate quantum teleportation protocols with photons." },
  ],
  references: [
    "Einstein, A., Podolsky, B., & Rosen, N. (1935). Can Quantum-Mechanical Description of Physical Reality Be Considered Complete? Physical Review.",
    "Bell, J. S. (1964). On the Einstein Podolsky Rosen paradox. Physics Physique Физика.",
    "Nielsen, M. A., & Chuang, I. L. (2010). Quantum Computation and Quantum Information.",
  ],
};

export default function Paper() {
  const refs = {
    abstract: useRef(null),
    introduction: useRef(null),
    background: useRef(null),
    setup: useRef(null),
    results: useRef(null),
  };
  const [isNavOpen, setNavOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    refs[sectionId].current.scrollIntoView({ behavior: "smooth" });
    setNavOpen(false); // close nav after click
  };

  return (
    <div className="relative max-w-7xl mx-auto p-6">
      {/* Icon Button to toggle nav */}
      <button
        className="fixed top-4 left-4 z-50 p-3 rounded-full shadow"
        onClick={() => setNavOpen(!isNavOpen)}
        aria-label="Toggle Navigation"
      >
        {/* Hamburger Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Toggleable Navigation Bar */}
      {isNavOpen && (
        <nav
          className="fixed top-20 left-4 h-[calc(100vh-5rem)] w-48 flex flex-col backdrop-blur-sm shadow-lg rounded-lg p-4 z-50"
          aria-label="Section navigation"
        >
          <ul className="flex flex-col space-y-4 font-semibold cursor-pointer">
            {Object.keys(refs).map((key) => (
              <li
                key={key}
                onClick={() => scrollToSection(key)}
                className="hover:underline"
              >
                {paper.content.find((c) => c.id === key)?.text || key}
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Main Content */}
      <main>
        {/* Title Page */}
        <section className="text-center my-12">
          <h1 className="text-5xl font-bold mb-4">{paper.title}</h1>
          <p className="text-xl italic">Scientific Research Article</p>
          <div className="mt-8 flex justify-center space-x-4">
            {paper.authors.map((author, idx) => (
              <p key={idx} className="text-lg">{author}</p>
            ))}
          </div>
        </section>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mt-8">
          {paper.content.map((block, idx) => {
            if (block.type === "heading1") {
              return (
                <h2
                  key={idx}
                  ref={block.id ? refs[block.id] : null}
                  className="text-3xl font-semibold mt-10 mb-4"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "heading2") {
              return (
                <h3
                  key={idx}
                  ref={block.id ? refs[block.id] : null}
                  className="text-2xl font-medium mt-8 mb-3"
                >
                  {block.text}
                </h3>
              );
            }
            if (block.type === "paragraph") {
              return (
                <p key={idx} className="mb-6 leading-relaxed">
                  {block.text}
                </p>
              );
            }
            return null;
          })}
        </article>

        {/* References */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">
            References
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            {paper.references.map((ref, idx) => (
              <li key={idx}>{ref}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
