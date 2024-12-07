
import React, { useContext } from "react";
import { GlobalFilterContext} from "../../GlobalFilterContext";
import ReactSlider from 'react-slider'
import "../../StyleSheets/FilterFrequencies.css"

export function FilterFrequencies({
    min_frequency = 0,
    max_frequency = 100,
    setFreq
}){
    const {setFilter__frequencies} = useContext(GlobalFilterContext);

    return(
            <ReactSlider
                className="frequency-filter"
                thumbClassName="frequency-filter-thumb"
                trackClassName="frequency-filter-track"
                defaultValue={[min_frequency, max_frequency]}
                ariaLabel={['Min Frequency', 'Max Frequency']}
                ariaValuetext={state => state.valueNow}
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                pearling = {true}
                minDistance={0.1}
                step = {0.01}
                onAfterChange = {(e)=>setFreq(e)}
            />
    )
}