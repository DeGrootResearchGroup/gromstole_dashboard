import React from "react";
import Select from "react-select";

export function FilterMutations({
    _g_mutations,
    setFilter__mutations,
}){
    return(
        <div data-testid = "select-filter-mutation">
            <Select 
            placeholder="Filter by Mutations"
            defaultValue={_g_mutations.map((e)=>({value:e,label:e}))} 
            options={_g_mutations.map((e)=>({value:e,label:e}))} 
            isMulti
            onChange={(options)=>{setFilter__mutations(options.map((e)=>{return(e.value)}))}}
            />
        </div>
    )
}