import React, { useContext } from "react";
import { GlobalDataContext} from "../../GlobalDataContext";
import { GlobalFilterContext} from "../../GlobalFilterContext";
import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';


export function FilterMutationsCoord({setMutations, autofill}){

    const {_g_date_headers} = useContext(GlobalDataContext);
    const [coord_one, setCoordOne] = useState(0);
    const [coord_two, setCoordTwo] = useState(30300);

    useEffect(()=>{
        // setMutations(_g_date_headers.filter(mut => {
        //     let coord = parseInt(mut.match(/\d+/));
        //     return coord_one <= coord && coord <= coord_two;
        // }));
        setMutations([coord_one, coord_two])
    },[coord_one,coord_two])

    return (
        <div className="FilterMutationsCoord">
            <Stack spacing={2} direction="row" justifyContent="center">
                <TextField id="coordinate-one" label="From" variant="outlined" error={parseInt(coord_one) > parseInt(coord_two)}
                        type="number" value={coord_one} onChange={(event) => {setCoordOne(event.target.value)}}/>
                <TextField id="coordinate-two" label="To" variant="outlined" error={parseInt(coord_one) > parseInt(coord_two)}
                        type="number" value={coord_two} onChange={(event) => {setCoordTwo(event.target.value)}}/>
            </Stack>
            <FormHelperText>{parseInt(coord_one) > parseInt(coord_two) ? 'Start coordinate must be before end coordinate.' : ' '}</FormHelperText>
        </div>
    )
}
