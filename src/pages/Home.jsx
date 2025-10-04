import { useState } from 'react'
import { useNavigate } from 'react-router'

function Home() {
    const navigate = useNavigate();

    return (
        <>
        <h1>Home</h1>
        <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigate("/")}>Home</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigate("/results")}>Results</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigate("/paper")}>Paper</button>
        </div>
        </>
    )
}

export default Home
