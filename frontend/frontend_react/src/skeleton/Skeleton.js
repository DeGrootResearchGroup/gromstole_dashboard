import React from 'react'
import "./Skeleton.css"

function Skeleton({ width, height, variant }) {
    const style = {
        width: width,
        height: height
    };
    return <span className={`skeleton ${variant}`} style={style}></span>
}

export default Skeleton