import React from "react";
import { useContext, useState } from "react";
import TextField from '@mui/material/TextField';
// import Dropdown from "./Dropdown";
import CancelIcon from '@mui/icons-material/Cancel';
import '../../../StyleSheets/FilterLineages.css';
import { GlobalFilterContext } from "../../../GlobalFilterContext";

// const {gatherChildren} = require("./util")

export function FilterLineages({ setLineages }){
    // const {lineages} = useContext(GlobalDataContext);
    // const {setFilter__lineages} = useContext(GlobalFilterContext);
    const {setFilter__sublineage} = useContext(GlobalFilterContext);

    function handleChange(e) {
        setFilter__sublineage(e.target.checked);
     }

    const removeQuery = (id, name) => {
        setQuery(query.filter(x => x.id !== id))
        setLineages(((prevLineage) => prevLineage.filter(x => x !== name)))
    }

    const onInputUpdate = function(e){
        // setCurrSelection(e.target.value)
        // if(!_g_lineage_trie || !_g_lineage_trie.root) return;

        // let cur = _g_lineage_trie.root;
        // const lineage = e.target.value;
        // const lineage_nodes = lineage.split(".");
        // for (let i = 0; i < lineage_nodes.length; i++) {
        //     const node = lineage_nodes[i];
        //     if(cur.children[node])
        //         cur = cur.children[node];
        // }
        // setMenuRoot(cur);
        // console.log(menuRoot)

        if(e.key === "Enter") {
            // TODO: Check to see if the lineage is already in the query list
            setId(id+1)
            setQuery([...query, {'query': currSelection, 'id': id}])
            setLineages(((prevLineage) => [...prevLineage, e.target.value]))
            // setLineages(gatherChildren(cur,[cur.children]));
        }
    }
    
    // const [toggleLineageMenu,setToggleLineageMenu]=  useState(false)
    // const [menuRoot,setMenuRoot] = useState(_g_lineage_trie.root);
    const [currSelection, setCurrSelection] = useState('');
    const [query, setQuery] = useState([])
    const [id, setId] = useState(0)

    // useEffect(()=>{console.log("menuRoot=",menuRoot)},[menuRoot])
    // useEffect(()=>{setMenuRoot(_g_lineage_trie.root)},[_g_lineage_trie])

    // if(!menuRoot)
    //     return;

    return (
        <div className="FilterLineages">
            <TextField 
                className="FilterLineages__searchbox"
                id="outlined-basic" 
                label="Lineages" 
                variant="outlined"
                value={currSelection}
                onChange={(e) => setCurrSelection(e.target.value)}
                onKeyDown={onInputUpdate}
            />
            <div className="FilterLineages__sublineages">
                <input type="checkbox" onChange = {handleChange}/>
                <span>Include Sublineages</span>
            </div>
            <div className="FilterLineages__query">
                {query.map((lin) => (
                    <div key={lin.id} className="FilterLineages__item">
                        <div className="FilterLineages__search">{lin.query}</div>
                        <CancelIcon onClick={() => removeQuery(lin.id, lin.query)} />
                    </div>
                ))} 
            </div>
        </div>
    )
}