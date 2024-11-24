var fs = require('fs');

$JSON_DATA_FILE = "./data/example.json";

let raw_json,json_data,lineage_data, lineage_headers
raw_json = fs.readFileSync($JSON_DATA_FILE);
json_data = JSON.parse(raw_json);
lineage_data = json_data['lineages']
lineage_headers = Object.keys(lineage_data)

// first make a sparse-count
let sparse_count = {}

// fill up the values for sparse-count
lineage_headers.forEach((lh)=>{
    sparse_count[lh] = {}

    // lm is the dictionary of mutations in a lineage
    const lm = lineage_data[lh].mutations;
    
    // lm_locs is an array of all locations of mutations in a lineage
    const lm_locs = Object.keys(lm);
    
    // total count of mutations in a lineage
    let total = 0;
    
    lm_locs.forEach((loc)=>{
        const mutation_types = Object.keys(lm[loc]);
        const mutation_counts = Object.values(lm[loc]);

        for (let i = 0; i < mutation_types.length; i++) {
            const m_type = mutation_types[i];
            const m_count = mutation_counts[i];
            sparse_count[lh][loc+m_type] = m_count;
            total+=m_count
        }
        sparse_count[lh]['total'] = total;
    })

})

lineage_headers.forEach((lh)=>{
    const total = sparse_count[lh].total;
    Object.keys(sparse_count[lh]).forEach((mut_type)=>{
        sparse_count[lh][mut_type] = 100*Math.round(1000*sparse_count[lh][mut_type]/total)/1000
        delete(sparse_count[lh].total)
    })
})

console.log(sparse_count);