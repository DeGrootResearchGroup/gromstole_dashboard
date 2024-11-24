import { rest } from "msw";
import { 
    $API_URL, 
    $LINEAGE_HEADERS_ENDPOINT,
    $MUTATION_HEADERS_ENDPOINT,
    $SPARSE_MATRIX_ENDPOINT, 
} from "../../config";

import test_data_lineages from "../test_data/lineage_headers.json";
import test_data_mutations from "../test_data/mutation_headers.json";
import test_data_frequencies from "../test_data/sparse_frequencies.json";

export const handlers = [
    rest.get($API_URL + $LINEAGE_HEADERS_ENDPOINT, (req,res,ctx)=>{
        console.log("MOCKING FetchLineages",$API_URL+$LINEAGE_HEADERS_ENDPOINT)
        return res(
            ctx.status(200),
            ctx.json(test_data_lineages)
        )
    }),
    rest.get($API_URL + $MUTATION_HEADERS_ENDPOINT, (req,res,ctx)=>{
        console.log("MOCKING FetchMutations",$API_URL+$MUTATION_HEADERS_ENDPOINT)
        return res(
            ctx.status(200),
            ctx.json(test_data_mutations)
        )
    }),
    rest.get($API_URL + $SPARSE_MATRIX_ENDPOINT, (req,res,ctx)=>{
        console.log("MOCKING FetchFrequencies",$API_URL+$SPARSE_MATRIX_ENDPOINT)
        return res(
            ctx.status(200),
            ctx.json(test_data_frequencies)
        )
    })
]