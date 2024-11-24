import React, { useEffect, useState } from "react";
import colors from "../helpers/SetColourGradient";
import { useContext } from "react";
import { GlobalFilterContext } from "../GlobalFilterContext";
import { GlobalDataContext } from "../GlobalDataContext";
import Tooltip  from '@mui/material/Tooltip';

export function MyCell({props}){
    
    const [value,setValue] = useState(0);
    const [amino_acid, setAA] = useState("N/A");
    const [sample_count, setCount] = useState(0);
    const [ins_seq, setInsSeq] = useState();
    const {frequency_toggle} = useContext(GlobalFilterContext);
    const {_g_aa_context} = useContext(GlobalDataContext);
    
    useEffect(()=>{
        if(props.row && props.column.key && props.row[props.column.key]){
            setValue(props.row[props.column.key]['frequency'])
            setCount(props.row[props.column.key]['count'])       
        }

        if(props.column.key.includes("ins")) {
            setInsSeq(props.column.key.replace(/^(.*?)\ins/, ""));
        } 

        if( _g_aa_context[props.column.key] && _g_aa_context[props.column.key].length > 0) {
            setAA(_g_aa_context[props.column.key])
        }

    },[props])

    let tooltip_text = ""
    if(ins_seq) {
        tooltip_text = <div><b>Context:</b> {Array.isArray(amino_acid) ? amino_acid.join(' '): amino_acid} <br /> 
        <b>Number of Samples:</b> {sample_count} <br />
        <b>Sequence:</b> {ins_seq ? ins_seq : ""} <br /> </div>
    }
    else {
        tooltip_text = <div><b>Context:</b> {Array.isArray(amino_acid) ? amino_acid.join(' '): amino_acid} <br /> 
        <b>Number of Samples:</b> {sample_count} <br /></div>
    }

    
    return(
        <div>
            <Tooltip title={tooltip_text} arrow>
                <div style={{
                    background: `${colors(value)}`,
                    fontSize: frequency_toggle ? 0 : 15,
                    color: "black",
                    }}>
                    {value}
                </div>
            </Tooltip>
        </div>
    )
}