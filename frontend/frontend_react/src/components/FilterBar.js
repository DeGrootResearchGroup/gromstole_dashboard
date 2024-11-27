import { FilterFrequencies } from "./FilterComponents/FilterFrequencies";
import {FilterLineages} from "./FilterComponents/FilterLineages/FilterLineages"
import {FilterMutationsCoord} from "./FilterComponents/FilterMutationsCoord";
import {FilterMutations} from "./FilterComponents/FilterMutations";
import {FilterDates} from "./FilterComponents/FilterDates";
import '../StyleSheets/FilterBar.css'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useState, useContext, useRef } from "react";
import { GlobalFilterContext,formatToYearWeek } from "../GlobalFilterContext";
import { GlobalDataContext } from "../GlobalDataContext";
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

export function FilterBar(){
    const [frequency, setFrequency] = useState([0,100]);
    const [reset, setReset] = useState(true)
    const {_g_date_headers} = useContext(GlobalDataContext);
    const [lineages, setLineages] = useState('');
    const [dates, setDates] = useState([new Date('2019-12-01'), new Date()]);
    const mutationOptions = ['ins','del','sub'];
    const [mutations, setMutations] = useState([]);
    const {setFilter__frequencies, setFilter__lineages, setFilter__coordinates, setFilter__mutations, setFilter__reset, setFilter__dates} = useContext(GlobalFilterContext);
    const [open, setOpen] = useState(true);
    const selectRef = useRef(null); // use a Ref to clear the values of the mutations-dropdown 

    const toggleOpen = () => {
        open ? document.getElementById("Table").className = "Table-expanded" : document.getElementById("Table").className = "Table";
        setOpen(!open)
    }

    const handleSubmit = () => {
        // console.log(lineages, mutations, frequency, dates);
        setFilter__mutations(mutations);
        // setFilter__lineages(dates.filter(lineage=> lineages.includes(lineage)));
        // setFilter__dates(dates);
        setFilter__dates([formatToYearWeek(dates[0]), formatToYearWeek(dates[1])])
        setFilter__lineages(lineages);
        setFilter__frequencies(frequency);
    }
    const clearFilters = () => {
        setFilter__lineages('')
        setLineages('')
        // setDates(_g_mutation_headers)
        setDates([new Date('2019-12-01'), new Date()])
        // setFilter__dates([new Date('2019-12-01'), new Date()])
        setFilter__dates([formatToYearWeek(new Date('2019-12-01')), formatToYearWeek(new Date())])
        setFrequency([0,100])
        setFilter__frequencies([0,100])
        setFilter__coordinates([0,30300])
        if(selectRef.current) 
            selectRef.current.clearValue();
        setMutations([])
        setFilter__mutations([])
        setReset(!reset)
        setFilter__reset(true);
    }

    return(
        <div className="collapsibleFilter">
            <button className="menuBtn" onClick={toggleOpen}>
                {open ? <CloseIcon/>: <MenuIcon/>}
            </button>
            <div className={open ? "FilterBar" : "sidenavClosed"} > 
                <div className="FilterBar__item">
                    <div className="FilterBar__title">Select Lineage(s):</div>
                    <FilterLineages setLineages={setLineages} key={reset}/>
                </div>

                <div className="FilterBar__item">
                    <div className="FilterBar__title">Frequency Range:</div>
                    <FilterFrequencies setFreq={setFrequency} key={reset}/>
                </div>

                <div className="FilterBar__item">
                    <div className="FilterBar__title">Mutations:</div>
                    <FilterMutations selectRef = {selectRef} mutationOptions={mutationOptions} setMutations={setMutations}></FilterMutations>
                </div>

                <div className="FilterBar__item">
                    <div className="FilterBar__title">Coordinates:</div>
                    <FilterMutationsCoord key={reset} setCoords={setFilter__coordinates}></FilterMutationsCoord>
                    
                </div>

                <div className="FilterBar__item">
                    <div className="FilterBar__title">Latest Sample Date:</div>
                    <FilterDates key={reset} setDates={setDates}></FilterDates>
                </div>

                <div className="FilterBar__item">
                    <Stack spacing={2} direction="row" justifyContent="center">
                        <Button variant="contained" onClick={handleSubmit}>Filter</Button>
                        <Button variant="outlined" onClick={clearFilters}>Reset</Button>
                    </Stack>
                </div>
            </div>
         </div>
    )
}