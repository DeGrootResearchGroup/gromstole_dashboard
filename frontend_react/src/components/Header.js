import { FreqLegend } from "./FreqLegend";
import { FrequencyToggle} from "./FrequencyToggle";
import Button from '@mui/material/Button';
import "../StyleSheets/Header.css";
import { GlobalFilterContext } from "../GlobalFilterContext";
import { $API_URL, $CSV_ENDPOINT} from "../config";
import { useContext} from "react";

const url_csv = $API_URL + $CSV_ENDPOINT;

async function makeAsyncRequest(data, filter__frequencies,filter__mutations,filter__dates,filter__sublineage) {
    const body = {
        lineages: data.map((d) => d['lineage']).join(','),
        frequencies: filter__frequencies.join(','),
        mutations: filter__mutations.join(','),
        dates: filter__dates.join(','),
        sublineage: filter__sublineage.toString()
    }

    try {
        const response = await fetch(url_csv, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Error making request to backend');
        }

        // Convert the response to a Blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;

        // Set the download filename
        link.setAttribute('download', 'data.csv');

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up and remove the link
        link.parentNode.removeChild(link);
    } catch (error) {
        console.error('Error:', error);
    }
}

export function Header(){
    const {filter__frequencies,filter__mutations, filter__dates, current_data, filter__sublineage} = useContext(GlobalFilterContext);
    return(
        <div className="Header">
            <Button id='export-container' variant="contained" size="small" onClick={() => makeAsyncRequest(current_data, filter__frequencies,filter__mutations,filter__dates,filter__sublineage)} style={{ width: "50px", height: "25px"}}>CSV</Button>
            <FrequencyToggle/>
            <FreqLegend/>
        </div>
    )
}