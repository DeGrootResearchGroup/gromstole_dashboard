var express = require('express');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { Parser } = require('json2csv');
var fs = require('fs');

// Limit for the number of requests to generate a CSV
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 2,
    message: 'Too many requests from this IP, please try again later.'
  });

const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Encoding, start, limit, frequency, lineages, sublineages, mutations, dates, sort_column, sort_direction');
    res.header('Access-Control-Max-Age', 2592000);
    next();
});
app.use(compression());
app.use(express.json({limit: '1mb'}));

const {
	$DATA_FOLDER,
	$NODE_PORT,
    $NODE_ENV,
    $FRONTEND_TESTDATA_DIR,
	$RESPONSE_HEADERS} = require("./config.js")

const {
    filterBy__Lineage,
    filterBy__PangoCode,
    expand_lineage,
    filtered_results
} = require('./utils')

const {Node,Trie} = require("./Trie")

let pango_designation_raw,pango_designation, example_json,lineage_data,lineage_headers,lineage_trie,expanded_lh=[];

// load pango designation table
try {
    pango_designation_raw = fs.readFileSync("pango_designation.json");
    pango_designation = JSON.parse(pango_designation_raw);
} catch (error) {
    console.log("Failed to read pango_designation.json file");
    return;
}
delete(pango_designation_raw);

// loading the lineage data
try {
	example_json = fs.readFileSync(`${$DATA_FOLDER}/example.json`);
    lineage_data = JSON.parse(example_json)['lineages'];
    mutation_data = JSON.parse(example_json)['mutations']
    lineage_headers = Array.from(new Set(Object.keys(lineage_data))).sort()
} catch (error) {
	console.log("Failed to read example.json data file");
    return;
}
delete(example_json)

// lineage-trie (for autocomplete, search/filter, dropdown-menu)
lineage_trie = new Trie();
lineage_headers.forEach((lh)=>{
    expanded_lh.push([expand_lineage(lh), lh]);
});

expanded_lh.sort((a,b)=>a[0].localeCompare(b[0])).forEach((lh)=>{lineage_trie.insert(lh[0],lh[1])})

// prepare sparse_count and mutation_headers
let sparse_count = {};
let lineage_dates = {};

lineage_headers.forEach((lh)=>{
    sparse_count[lh] = {}

    // lm is the dictionary of mutations in a lineage
    const lm = lineage_data[lh].mutations;
    lineage_dates[lh] = [lineage_data[lh].earliest_coldate, lineage_data[lh].latest_coldate];

    // lm_locs is an array of all locations of mutations in a lineage
    const lm_locs = Object.keys(lm);
    
    // total count of mutations in a lineage
    let total = 0;

    lm_locs.forEach((loc)=>{
        const mutation_types = Object.keys(lm[loc]);
        const mutation_counts = Object.values(lm[loc]);

        for (let i = 0; i < mutation_types.length; i++) 
        {
            const m_type = mutation_types[i];
            const m_count = mutation_counts[i];
            sparse_count[lh][loc+m_type] = m_count;
            total+=m_count;
        }
        sparse_count[lh]['total'] = total;
    })
})

// prepare amino acid context
let aa_context = {}
let mut_loc = Object.keys(mutation_data);

mut_loc.forEach((loc) => {
    const mut_types = Object.keys(mutation_data[loc]);
    const mut_type_info = Object.values(mutation_data[loc]);

    for (let i = 0; i < mut_types.length; i++) {
        aa_context[loc+mut_types[i]] = [...Object.keys(mut_type_info[i]["context"])];
    }
})

// prepare sparse_frequencies
let sparse_frequencies = [];
let mutation_headers = new Set();
lineage_headers.forEach((lh)=>{
    let new_row = {'lineage':lh};
    const total = sparse_count[lh].total;
    Object.keys(sparse_count[lh]).forEach((mut_type)=>{
		if(mut_type!=='total') {
            let frequency = 100*Math.round(1000*sparse_count[lh][mut_type]/total)/1000;
            // check for mutations that have non-zero frequencies
            if(frequency > 0)
                mutation_headers.add(mut_type)
            new_row[mut_type] = {
                'frequency' : frequency,
                'count': sparse_count[lh][mut_type]
            }
        }
    })
    sparse_frequencies.push(new_row);
})
delete(sparse_count)

// omit mutations where none of the lineages have non-zero frequencies
let valid_sparse_frequencies = [];
sparse_frequencies.forEach((lineage) => {
    let new_row = {'lineage':lineage['lineage']};
    mutation_headers.forEach((mutation) => {
        if(lineage[mutation]) {
            new_row[mutation] = lineage[mutation]
        }
    })
    valid_sparse_frequencies.push(new_row)
})
delete(sparse_frequencies)
mutation_headers=Array.from(mutation_headers).sort();

// Lineage keyed valid_sparse_frequencies
var updated_sparse_frequencies = {}
valid_sparse_frequencies.forEach((lineage) => {
    updated_sparse_frequencies[lineage['lineage']] = lineage
});

if($NODE_ENV=='TEST')
{
    console.log(`Writing lineage_trie, lineage_headers, mutation_headers, sparse_frequencies to directory ${$FRONTEND_TESTDATA_DIR}`);
    fs.writeFileSync(`./${$FRONTEND_TESTDATA_DIR}/lineage_trie.json`,JSON.stringify(lineage_trie));
    fs.writeFileSync(`./${$FRONTEND_TESTDATA_DIR}/lineage_headers.json`,JSON.stringify(lineage_headers));
    fs.writeFileSync(`./${$FRONTEND_TESTDATA_DIR}/mutation_headers.json`,JSON.stringify(mutation_headers));
    fs.writeFileSync(`./${$FRONTEND_TESTDATA_DIR}/sparse_frequencies.json`,JSON.stringify(valid_sparse_frequencies));
}

console.log(`Serving ${lineage_headers.length} lineages and ${mutation_headers.length} mutations`);
console.log(`NODE_ENV=${$NODE_ENV}\nNODE_PORT = ${$NODE_PORT}\nDATA_FOLDER = ${$DATA_FOLDER}`);

app.get('/lineage_trie', (req, res) => {
    res.status(200).send(JSON.stringify(lineage_trie))
});

app.get('/lineage_headers', (req, res) => {
    res.status(200).send(JSON.stringify(lineage_headers))
});

app.get('/mutation_headers', (req, res) => {
    res.status(200).send(JSON.stringify(mutation_headers))
});

app.get('/sparse_frequencies', (req, res) => {
    const start = req.headers.start;
    const limit = req.headers.limit;
    // return a subset of the matrix
    const subset = valid_sparse_frequencies.slice(parseInt(start), parseInt(start) + parseInt(limit));
    res.status(200).send(JSON.stringify(subset));
});

app.post('/csv', limiter, (req, res) => {
    let filter__frequencies = req.body.frequencies;
    let filter__lineages = req.body.lineages;
    let filter__mutations = req.body.mutations;
    let filter__dates = req.body.dates;
    let filter__sublineages = req.body.sublineage;

    const [_,filtered_matrix] = filtered_results(filter__frequencies,filter__mutations,filter__dates,filter__lineages,filter__sublineages,updated_sparse_frequencies,lineage_headers,lineage_dates,lineage_trie);

    const csv_matrix = [];
    filtered_matrix.map(value => {
        let row = {};
        Object.keys(value).map((mut) => {
            if (mut === 'lineage') {
                row[mut] = value[mut];
            } else if (value[mut].frequency > 0) {
                row[mut] = value[mut].frequency;
            }
        });
        csv_matrix.push(row);
    });

    try {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(csv_matrix);
    
        res.header('Content-Type', 'text/csv');
        res.attachment('data.csv');
    
        res.send(csv);
    } catch (err) {
        res.status(500).send('Error when generating the CSV');
    }
});

app.get('/aa_context', (req, res) => {
    res.status(200).send(JSON.stringify(aa_context));
});

app.get('/lineage_dates', (req, res) => {
    res.status(200).send(JSON.stringify(lineage_dates))
});

app.get('/filter', (req, res) => {
    let filter__frequencies = req.headers.frequency;
    let filter__lineages = req.headers.lineages;
    let filter__mutations = req.headers.mutations;
    let filter__dates = req.headers.dates;
    let filter__sublineages = req.headers.sublineages;

    const [col_names,filtered_matrix] = filtered_results(filter__frequencies,filter__mutations,filter__dates,filter__lineages,filter__sublineages,updated_sparse_frequencies,lineage_headers,lineage_dates,lineage_trie);
    res.status(200).send(JSON.stringify({'columns':col_names, 'rows':filtered_matrix}))
});

app.get('/api/lineage', (req, res) => {
    let results = [];
    const query_args = url.parse(req.url,true).query;
    const bool__query_lineage = Object.keys(query_args).includes('lineage');
    const bool__query_mutation_type = Object.keys(query_args).includes('mutation_type');
    const bool__query_mutation_coordinate = Object.keys(query_args).includes('mutation_coordinate');
    if(bool__query_lineage)
    {
        const query_list__lineages = query_args['lineage'].split(",");
        query_list__lineages.forEach((lq) => {
            if(/\d/.test(lq))
                results = results.concat(filterBy__Lineage(lq,valid_sparse_frequencies));
            else
                results = results.concat(filterBy__PangoCode(lq,valid_sparse_frequencies));
        })
    }
    res.end(JSON.stringify(results))
});

app.listen($NODE_PORT, () => {
    console.log(`Server running on port ${$NODE_PORT}`)
});