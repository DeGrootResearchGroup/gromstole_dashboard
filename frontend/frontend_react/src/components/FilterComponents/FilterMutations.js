import React from "react";
import Select from "react-select";

export function FilterMutations({
    selectRef,
    mutationOptions,
    setMutations,
}){
    return(
        <div data-testid = "select-filter-mutation">
            <Select 
            ref = {selectRef}
            placeholder="Filter by Mutations"
            defaultValue={[]} 
            options={mutationOptions.map((e)=>({value:e,label:e}))} 
            isMulti={true}
            isClearable={true}
            onChange={(options)=>{setMutations(options.map((e)=>{return(e.value)}))}}
            />
        </div>
    )
}