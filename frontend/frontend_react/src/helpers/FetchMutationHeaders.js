import {useFetchData } from "./useFetchData";
import { $API_URL, $MUTATION_HEADERS_ENDPOINT } from "../config";

export function FetchMutationHeaders(){
    return useFetchData($API_URL + $MUTATION_HEADERS_ENDPOINT);
}
