import {useFetchData } from "./useFetchData";
import { $API_URL, $DEFAULTS_ENDPOINT } from "../config";

export function FetchDefaults(){
    return useFetchData($API_URL + $DEFAULTS_ENDPOINT);
}
