// we dont really need this data for rendering the table
// but it would help with autofill during filtering/searching 
import {useFetchData } from "./useFetchData";
import { $API_URL, $LINEAGE_HEADERS_ENDPOINT } from "../config";

export function FetchLineageHeaders(){
    return useFetchData($API_URL + $LINEAGE_HEADERS_ENDPOINT);
}
