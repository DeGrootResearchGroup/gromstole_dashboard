import React, { useEffect, useState, useRef }  from 'react'
import Skeleton from "./Skeleton";
import "./Skeleton.css"

function DashboardSkeleton() {

    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        setHeight(ref.current.clientHeight)
        setWidth(ref.current.clientWidth)
    })


    return (
        <div className="Dashboard">
            <div className="skeleton-filterbar">
                <div className="skeleton-close">
                    <Skeleton width={30} height={30} />
                </div>
                <div className="skeleton-filterbar-item">
                    <Skeleton width={150} height={30} />
                    <Skeleton height={40} />
                    <Skeleton width={160} height={30} />
                </div>
                <div className="skeleton-filterbar-item">
                    <Skeleton width={150} height={30} />
                    <Skeleton height={30} />
                </div>
                <div className="skeleton-filterbar-item">
                    <Skeleton width={150} height={30} />
                    <Skeleton height={30} />
                </div>
                <div className="skeleton-filterbar-item">
                    <Skeleton width={150} height={30} />
                    <Skeleton height={30} />
                </div>
                <div className="skeleton-button">
                    <Skeleton width={80} height={30} />
                    <Skeleton width={80} height={30} />
                </div>
            </div>
            {/* <FilterBar/> */}
            <div className="Dashboard_vBox" ref={ref}>
                <div className="skeleton-header">
                    <Skeleton width={80} height={30} />
                    <Skeleton width={80} height={30} />
                    <Skeleton width={250} height={30} />
                </div>
                {/* <Header/> */}
                <table>
                    <tbody>
                        {Array.from({ length: height/40 }).map((_, index) => (
                            <tr key={index}>
                                {Array.from({ length: width/120 }).map((_, index) => (
                                    <td key={index}><Skeleton width={100} height={25} /></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default DashboardSkeleton