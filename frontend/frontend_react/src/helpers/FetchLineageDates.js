import {useFetchData } from "./useFetchData";
import { $API_URL, $LINEAGE_DATES_ENDPOINT } from "../config";

export function FetchLineageDates(){
    return useFetchData($API_URL + $LINEAGE_DATES_ENDPOINT);
}
