import { useContext, useEffect } from "react";
// import { Table } from "./Table";
import { FilterBar } from "./FilterBar";
import { Header } from "./Header";
import "../StyleSheets/Dashboard.css"
import {GlobalFilterContext} from "../GlobalFilterContext"
import {GlobalDataContext} from "../GlobalDataContext"
import DashboardSkeleton from "../skeleton/DashboardSkeleton";
import CollapsedTable from "./CollapsedTable/CollapsedTable";
import { LoadingScreen } from './LoadingScreen';



export function Dashboard(){
    const {
        loading__g_mutation_headers,
        // loading__g_lineage_trie,
        loading__g_date_headers,
        loading__g_defaults,
        // loading__g_sparse_matrix,
        // loading__g_aa_context
        }  = useContext(GlobalDataContext);

    // const {setFilter__lineages} = useContext(GlobalFilterContext);
    // const {_g_mutation_headers} = useContext(GlobalDataContext);

    // useEffect(()=>{
    //     if(_g_mutation_headers && _g_mutation_headers.length)
    //       setFilter__lineages(_g_mutation_headers)
    // },[_g_mutation_headers, setFilter__lineages])
    // const [checked, setCheck] = useState(true)

    if (
        !loading__g_mutation_headers &&
        // !loading__g_lineage_trie &&
        !loading__g_date_headers && 
        !loading__g_defaults
        // &&
        // !loading__g_sparse_matrix &&
        // !loading__g_aa_context
    )
    {
        return(
            <div className="Dashboard">
                <FilterBar/>
                <div className="Dashboard_vBox">
                    <Header/>
                    {/* <Table/> */}
                    <CollapsedTable/>
                </div>
            </div>
        )
    }
    else {
        // return <DashboardSkeleton/>
        return <LoadingScreen/>
    }    
}