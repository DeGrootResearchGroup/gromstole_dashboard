import { createContext, useState } from "react";

export const GlobalFilterContext = createContext();

export const GlobalFilterContextProvider = function(props){

    const [filter__frequencies, setFilter__frequencies] = useState([0,100]);
    const [filter__mutations, setFilter__mutations] = useState([]); // ['ins','del','sub']
    const [filter__coordinates, setFilter__coordinates] = useState([0,30300]);
    const [filter__lineages, setFilter__lineages] = useState([]);
    const [filter__dates, setFilter__dates] = useState(useState([new Date('2019-12-01'), new Date()]));
    const [frequency_toggle, setToggle] = useState(false);
    const [filter__sublineage, setFilter__sublineage] = useState(false);
    const [filter__reset, setFilter__reset] = useState(false);
    const [current_data, setCurrentData] = useState([]);

    return (
        <GlobalFilterContext.Provider value = {
            {
                filter__frequencies, setFilter__frequencies,
                filter__mutations, setFilter__mutations,
                filter__lineages, setFilter__lineages,
                filter__coordinates, setFilter__coordinates,
                filter__sublineage, setFilter__sublineage,
                frequency_toggle, setToggle,
                filter__dates, setFilter__dates,
                current_data, setCurrentData,
                filter__reset, setFilter__reset
            }
        }>
            {props.children}
        </GlobalFilterContext.Provider>
    )
}