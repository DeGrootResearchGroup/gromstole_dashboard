import { createContext, useState } from "react";

export const GlobalFilterContext = createContext();
export const formatToYearWeek = function(date) {
    // Create a copy of the date object
    const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    // Set to the nearest Thursday: current date + 4 - current day number
    // Sunday (0) becomes 7
    const dayNum = tempDate.getUTCDay() || 7; // Make Sunday = 7
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);

    // Get the first day of the year
    const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));

    // Calculate week number
    const weekNum = Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);

    // Return year and week in YYYY-WW format
    const yearEpiweek = `${tempDate.getUTCFullYear()}-${String(weekNum).padStart(2, '0')}`;
    console.log("CONVERTED ",date,yearEpiweek)
    return yearEpiweek;
}

// Example usage

export const GlobalFilterContextProvider = function(props){

    const [filter__frequencies, setFilter__frequencies] = useState([0,100]);
    const [filter__mutations, setFilter__mutations] = useState([]); // ['ins','del','sub']
    const [filter__regions, setFilter__regions] = useState([]); // ['UNKNOWN','South','North',etc..]
    const [filter__coordinates, setFilter__coordinates] = useState([0,30300]);
    const [filter__lineages, setFilter__lineages] = useState([]);
    const [filter__dates, setFilter__dates] = useState([formatToYearWeek(new Date('2019-12-01')), formatToYearWeek(new Date())]);
    const [frequency_toggle, setToggle] = useState(false);
    const [filter__sublineage, setFilter__sublineage] = useState(false);
    const [filter__reset, setFilter__reset] = useState(false);
    const [current_data, setCurrentData] = useState([]);

    return (
        <GlobalFilterContext.Provider value = {
            {
                filter__frequencies, setFilter__frequencies,
                filter__mutations, setFilter__mutations,
                filter__regions, setFilter__regions,
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