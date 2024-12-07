import React from "react";
import Select from "react-select";

export function FilterRegions({
    selectRef,
    regionOptions,
    setRegions,
}){
    return(
        <div data-testid = "select-filter-regions">
            <Select 
            ref = {selectRef}
            placeholder="Filter by Regions"
            defaultValue={[]} 
            options={regionOptions.map((e)=>({value:e,label:e}))} 
            isMulti={true}
            isClearable={true}
            onChange={(options)=>{setRegions(options.map((e)=>{return(e.value)}))}}
            />
        </div>
    )
}