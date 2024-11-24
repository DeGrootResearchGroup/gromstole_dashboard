const alias_key = require('../data/alias_key.json');

function filterBy__PangoCode(pango_code,sparse_frequencies){
    console.log(`getting PangoCode ${pango_code}`)
    let results = [];
    const pango_expansion = pango_designation[pango_code];
    pango_expansion.forEach((pe)=>{
        if(pe.endsWith("*"))
        {
            console.log(`getting by prefix ${pe}`)
            results = results.concat(
                filterBy__LineagePrefix(pe,sparse_frequencies)
            );
        }
        else
        {
            console.log(`getting by fullname ${pe}`)
            results = results.concat(
                filterBy__LineageFull(pe,sparse_frequencies)
            );
        }
    })
    return results;
}

// get by lineage-full-name or lineage-prefix
function filterBy__Lineage(lineage,sparse_frequencies){
    console.log(`getting lineage ${lineage}`)
    if(lineage.endsWith("*"))
    {
        console.log(`getting by prefix ${lineage}`)
        return (filterBy__LineagePrefix(lineage,sparse_frequencies));
    }
    else
    {
        console.log(`getting by fullname ${lineage}`)
        return (filterBy__LineageFull(lineage,sparse_frequencies));
    }
}

// get by lineage full name 
function filterBy__LineageFull(lineage_name,sparse_frequencies){
    return sparse_frequencies.filter(row => 
        {
            return (row['lineage'] == lineage_name);
        }
    );
}

// for getting lineages like BA.4* that end with an asterix
function filterBy__LineagePrefix(lineage_prefix,sparse_frequencies){
        return sparse_frequencies.filter((row)=>
        {
            return (row['lineage'].startsWith(lineage_prefix.slice(0,-1)));
        })
}

function gatherChildren(menuItem,results=[]){
    if(menuItem.exists)
        results.push(menuItem.alias);
    
    Object.values(menuItem.children).forEach((cmi)=>{
        results.concat(gatherChildren(cmi,results))
    })
    
    return results;
}


function expand_lineage(lineage) {
    var prefix = lineage.split(".")[0];
    while (alias_key[prefix] !== undefined && alias_key[prefix] != '' && prefix[0] !== "X") {
        lineage = lineage.replace(prefix, alias_key[prefix]);
        prefix = alias_key[prefix];
    }

    if (lineage == '') {
        console.log("lineage is empty");
    }

    return lineage;
}


function filtered_results(filter__frequencies, filter__mutations, filter__dates, filter__lineages, filter__sublineages, updated_sparse_frequencies, lineage_headers, lineage_dates, lineage_trie) {
    let col_names = new Set();
    let filtered_result = []

    if(!filter__frequencies || !filter__mutations || !filter__dates){
        return [[], []];
    }
    else {
        let filtered_matrix = [];
        // splits string to reform the array
        filter__frequencies = filter__frequencies.split(',')
        filter__mutations = filter__mutations.split(',')
        filter__lineages = filter__lineages.split(',')
        filter__dates = filter__dates.split(',')

        //  filter by lineage
        if ((filter__lineages.length == 1 && filter__lineages[0] === '') || !filter__lineages || !filter__lineages.length) {
            filtered_result = lineage_headers
        }
        else{
            filter__lineages.forEach((lineage) => {
                if (filter__sublineages === 'true') {
                    let expanded_lineage = expand_lineage(lineage);
                    let lineage_tokens = expanded_lineage.split('.');
                    var cur = lineage_trie.root;
                    for (let i = 0; i < lineage_tokens.length; i++) {
                        const node = lineage_tokens[i];
                        if(cur.children[node]){
                            cur = cur.children[node];
                        }  
                    }
                    filtered_result.push(...gatherChildren(cur, Object.keys(cur.children) > 0 ? [cur.children] : []))
                }
                else
                    filtered_result.push(lineage);
            });                
        }     

        // bottleneck in filtering process: filters matrix by dates, lineages, and frequency
        filtered_result.forEach(function(lin, index) {
            let date = lineage_dates[lin][1]
            if ((new Date (filter__dates[0]) <= new Date(date)) && (new Date (filter__dates[1]) >= new Date(date))) {
                let filtered_row = {'lineage': lin};
                Object.keys(updated_sparse_frequencies[lin]).forEach((mutation)=>{
                    if(updated_sparse_frequencies[lin][mutation].frequency >= filter__frequencies[0] && updated_sparse_frequencies[lin][mutation].frequency <= filter__frequencies[1]){
                        let coord = parseInt(mutation.match(/\d+/)[0]);
                        if (parseInt(filter__mutations[0]) <= coord && coord <= parseInt(filter__mutations[1])) {
                            filtered_row[mutation] = updated_sparse_frequencies[lin][mutation];
                            col_names.add(mutation);
                        }
                    }
                })
                if(Object.keys(filtered_row).length>1)
                    filtered_matrix.push(filtered_row);                    
            }
        })

        // sort mutations by increasing nucleotide position
        col_names = [...col_names].sort(function(a, b){
            let compared = parseInt(a.match(/\d+/) ) - parseInt(b.match(/\d+/))
            return compared === 0 ? a.length - b.length : compared
        })

        return [col_names, filtered_matrix];
    }
}

module.exports = {
    filterBy__Lineage,
    filterBy__PangoCode,
    expand_lineage,
    gatherChildren,
    filtered_results
}