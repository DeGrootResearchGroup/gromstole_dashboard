# Dynamic Table Generation

## Input Data from the backend API
### _g_lineage_trie
### _g_lineage_headers
### _g_mutation_headers
### _g_sparse_frequencies

`_g_lineage_trie` is not used in the table generation but it is used for generating the members of the `Dropdown__Lineages` menu. 
The translation between Pango and expanded is handled by the frontend. The backend sends the fully-expanded lineages. 

`_g_lineage_headers` is not used in the table generation but it is used when searching/filtering through the `Select__Lineages` component.

`_g_mutation_headers` is used for generating the column headers of the table

`_g_sparse_frequencies` is the actual items of the matrix.


## Data format for the React Data-Grid rows and columns
const columns = [
    { key: "lineage", name: "Lineage" },
    { key: "Adel1", name: "Adel1" ,formatter: ColorBoxFormatter},
    { key: "Tdel5", name: "Tdel5", formatter: ColorBoxFormatter }
];
   
const rows = [
    { 'lineage': 'P.3', 'Adel1': 3.4 },
    { 'lineage': 'A.1.3', 'Adel1': 2.4, 'Tdel5': 13 },
    { 'lineage': 'B.6.3', 'Adel1': 7.4, 'Tdel5': 63 },
];

## Next Steps
* User input searches with Pango codes. 
* Recombinant Pango codes begin with `X`. 

