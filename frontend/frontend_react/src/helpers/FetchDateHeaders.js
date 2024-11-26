import {useFetchData } from "./useFetchData";
import { $API_URL, $DATE_HEADERS_ENDPOINT } from "../config";

export function FetchDateHeaders(){
    return useFetchData($API_URL + $DATE_HEADERS_ENDPOINT);
}
