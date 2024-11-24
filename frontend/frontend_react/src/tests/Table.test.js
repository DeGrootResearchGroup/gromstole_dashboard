import { Table } from "../components/Table";
import _g_lineage_headers from "./test_data/lineage_headers.json";
import _g_mutation_headers from "./test_data/mutation_headers.json";
import _g_sparse_matrix from "./test_data/sparse_frequencies.json"
import { render,screen, fireEvent,waitFor} from "@testing-library/react";
import { GlobalFilterContext } from "../GlobalFilterContext";
import { GlobalDataContext } from "../GlobalDataContext";
import userEvent from "@testing-library/user-event";


describe("TESTSUITE: Render Table Empty" , () =>{
    beforeEach(async ()=>{
        await render(
            <GlobalDataContext.Provider value = {{
                _g_lineage_headers :_g_lineage_headers,
                _g_mutation_headers :_g_mutation_headers,
                _g_sparse_matrix :_g_sparse_matrix,
                _g_aa_context: {},
                _g_sample_counts :{} 
            }}>
                <GlobalFilterContext.Provider value = {{
                    filter__frequencies:[0,100],
                    filter__lineages:[],
                    filter__mutations:[]
                }}>
                    <Table/>
                </GlobalFilterContext.Provider>
            </GlobalDataContext.Provider>
        );
    })
    test("TEST: Render empty table", async()=>{
        const table = await screen.findByTestId("Table");
        // console.log(await table.textContent);
        expect(table.textContent).toBe("");
    })
})

describe("TESTSUITE: Render Table at (A.1,374A)" , () =>{
    beforeEach(async ()=>{
        await render(
            <GlobalDataContext.Provider value = {{
                _g_lineage_headers :_g_lineage_headers,
                _g_mutation_headers :_g_mutation_headers,
                _g_sparse_matrix :_g_sparse_matrix,
                _g_aa_context: {},
                _g_sample_counts :{} 
            }}>
                <GlobalFilterContext.Provider value = {{
                    filter__frequencies:[0,100],
                    filter__lineages:["A.1"],
                    filter__mutations:["374A"]
                }}>
                    <Table/>
                </GlobalFilterContext.Provider>
            </GlobalDataContext.Provider>
        );
    })
    test("TEST: Render Table at (A.1,374A)", async()=>{
        const table = await screen.findByTestId("Table");
        // console.log(await table.textContent);
        expect(table.textContent).toBe("374AA.11.8");
    })
})