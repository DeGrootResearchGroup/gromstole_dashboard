
import {useFetchData } from "./useFetchData";
import { $API_URL, $AA_CONTEXT_ENDPOINT } from "../config";

export function FetchAAContext(){
    return useFetchData($API_URL + $AA_CONTEXT_ENDPOINT);
}
