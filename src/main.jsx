import React from "react";
import ReactDOM from "react-dom/client";

import {BrowserRouter, Routes, Route} from "react-router-dom";

import Home from "./pages/Home";
import Results from "./pages/Results";
import Paper from "./pages/Paper";

import "./styles/main.css";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/paper" element={<Paper/>}/>
      <Route path="/results" element={<Results/>}/>
      <Route path="/graph" element={<KnowledgeGraph/>}/>
    </Routes>
  </BrowserRouter>
);
