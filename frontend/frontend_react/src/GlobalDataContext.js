import { createContext } from "react";
import { FetchDateHeaders } from './helpers/FetchDateHeaders';
import { FetchMutationHeaders } from "./helpers/FetchMutationHeaders";
import { FetchDefaults } from "./helpers/FetchDefaults";
import { FetchLineageTrie } from './helpers/FetchLineageTrie';
import { FetchAAContext } from "./helpers/FetchAminoAcidContext";
// import { FetchSampleCounts } from "./helpers/FetchSampleCounts";
import { FetchLineageDates } from "./helpers/FetchLineageDates";

export const GlobalDataContext = createContext();

export const GlobalDataContextProvider = function(props){
    const [_g_mutation_headers,loading__g_mutation_headers] = FetchMutationHeaders();
    // const [_g_lineage_dates,loading__g_lineage_dates] = FetchLineageDates();
    // const [_g_lineage_trie,loading__g_lineage_trie] = FetchLineageTrie();
    const [_g_date_headers,loading__g_date_headers] = FetchDateHeaders();
    const [_g_defaults, loading__g_defaults] = FetchDefaults();
    // const [_g_aa_context, loading__g_aa_context] = FetchAAContext();

    _g_date_headers.sort(function(a, b){
        let compared = parseInt(a.match(/\d+/) ) - parseInt(b.match(/\d+/))
        return compared === 0 ? a.length - b.length : compared
    })

    return (
        <GlobalDataContext.Provider value = {
            {
                _g_mutation_headers,     loading__g_mutation_headers,
                // _g_lineage_trie,        loading__g_lineage_trie,
                _g_date_headers,    loading__g_date_headers,
                _g_defaults,    loading__g_defaults,
                // _g_aa_context,          loading__g_aa_context,
                // _g_lineage_dates,       loading__g_lineage_dates,            
            
            }
        }>
            {props.children}
        </GlobalDataContext.Provider>

    )
}