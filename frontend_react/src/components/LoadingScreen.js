import React, { useContext } from "react";
import LoadingGIF from "./Loading_icon_cropped.gif";
import "../StyleSheets/LoadingScreen.css"
import { GlobalDataContext } from "../GlobalDataContext";

export function LoadingScreen(){
    const {
        loading__g_lineage_headers,
        loading__g_lineage_trie,
        loading__g_mutation_headers,
        // loading__g_sparse_matrix,
        loading__g_lineage_dates,
        loading__g_aa_context
        // loading__g_sample_counts
        }  = useContext(GlobalDataContext);

    if (
    loading__g_lineage_headers || 
    loading__g_lineage_trie ||
    loading__g_mutation_headers ||
    // loading__g_sparse_matrix ||
    loading__g_lineage_dates ||
    loading__g_aa_context 
    // loading__g_sample_counts
    )
    {
    return(
        <div className="loading-gif-container">
            <img className="loading-gif" src = {LoadingGIF} alt="Loading"/>
        </div>
    )
}
}