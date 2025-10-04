import { useState } from 'react'
import { useNavigate } from 'react-router'

function Results() {
    const navigate = useNavigate();

    return (
        <>
        <h1>Results</h1>
        <div>
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/results")}>Results</button>
            <button onClick={() => navigate("/paper")}>Paper</button>
        </div>
        </>
    )
}

export default Results
