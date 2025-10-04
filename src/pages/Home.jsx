import { useState } from 'react'
import { useNavigate } from 'react-router'

function Home() {
    const navigate = useNavigate();

    return (
        <>
        <h1>Home</h1>
        <div>
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/results")}>Results</button>
            <button onClick={() => navigate("/paper")}>Paper</button>
        </div>
        </>
    )
}

export default Home
