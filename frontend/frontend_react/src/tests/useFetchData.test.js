import { 
    $API_URL, 
    $LINEAGE_HEADERS_ENDPOINT,
    $MUTATION_HEADERS_ENDPOINT,
    $SPARSE_MATRIX_ENDPOINT, 
    } from "../config";

import { renderHook, waitFor } from '@testing-library/react';

import { useFetchData } from '../helpers/useFetchData';
import test_data_lineages from "./test_data/lineage_headers.json"
import test_data_mutations from "./test_data/mutation_headers.json"
import test_data_frequencies from "./test_data/sparse_frequencies.json"

import { server } from "./mocks/server";

describe('testing useFetchData',()=>{

    beforeAll(() => server.listen())
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())
    
    test('null URL should return undefined', async ()=>{
        const {result} = renderHook(async ()=> await useFetchData());
        await waitFor(async ()=>{
            expect((await result.current)[1]).toBeTruthy()
            expect((await result.current)[0]).toEqual([])
        })
    })
    test(`${$LINEAGE_HEADERS_ENDPOINT} URL should return test_data_lineages`, async ()=>{
        const {result} = renderHook(async ()=> await useFetchData($API_URL+$LINEAGE_HEADERS_ENDPOINT));
        await waitFor(async ()=>{
            expect((await result.current)[1]).toBeFalsy()
            expect((await result.current)[0]).toEqual(test_data_lineages)
        })
    })
    test(`${$MUTATION_HEADERS_ENDPOINT} URL should return test_data_mutations`, async ()=>{
        const {result} = renderHook(async ()=> await useFetchData($API_URL+$MUTATION_HEADERS_ENDPOINT));
        await waitFor(async ()=>{
            expect((await result.current)[1]).toBeFalsy()
            expect((await result.current)[0]).toEqual(test_data_mutations)
        })
    })
    test(`${$SPARSE_MATRIX_ENDPOINT} URL should return test_data_frequencies`, async ()=>{
        const {result} = renderHook(async ()=> await useFetchData($API_URL+$SPARSE_MATRIX_ENDPOINT));
        await waitFor(async ()=>{
            expect((await result.current)[1]).toBeFalsy()
            expect((await result.current)[0]).toEqual(test_data_frequencies)
        })
    })
    
})


/**
 * Check out this link on how to test custom hooks such as useFetchData();
 * https://stackoverflow.com/questions/59849496/test-react-hooks-state-using-jest-and-react-hooks-library
 * 

 */
