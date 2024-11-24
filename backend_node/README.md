# Backend API 

## Notes
* This backend API converts the Pango code into full-expansions to be used by the frontend.

## Questions
* How do I expand something like `XBC` which has multiple expansions `BA.2*`, `B.1.617.2*`, `BA.2*`, `B.1.617.2*`? What does it mean when a Pango code expands into multiple words? With the current data-set, I can assume just a single unique expansion for any Pango code. 
---------
---------

## API Endpoints

### `/lineage_trie`
* Serves a [Trie](https://en.wikipedia.org/wiki/Trie) of all the lineages. This is not required for rendering the table but it is crucial for searching/filtering features on the frontend. 

---------

### `/lineage_headers`
* Serves all the `lineage-headers`. 
```
["P.3","B.1.1.7","P.1.15","C.37","B.1","B.1.499","N.3","C.32","B.1.1.163","B.1.1","B.1.1.168","B.1.1.189","B.1.533","BA.1","A","D.2","B","B.5",...,"A.2","B.4.4","B.1.391","B.1.6","B.1.264","B.1.39","B.1.413","B.1.434","B.1.314","B.1.369"]
```
* Although this array is not necessary for rendering the `React-Data-Grid` table on the frontend, it is useful to deliver this array to the frontend because it can be used for  searching/filtering features on the frontend.

---------

### `/muatation_headers`
* Serves all the `mutation-headers`.
```
["66T","241T","3037T","4926G","5574G","7564A","8139T","9203A","9867C","11308A","12049T","12053T","14408T","17339T","22356G","23012A",...,"1392T","3251T","26625T","26176T","2018G","2447T","2914A","15708T","28821A"]

```
*  This is used by the `React-Data-Grid` frontend for rendering the column-headers.

---------

### `/sparse_frequencies`
* This endpoint provides the sparse-frequencies for lineage-mutations having non-zero frequencies.

* To use `React-Data-Grid` library on the frontend, we need to format the `sparse_frequencies` as
```
    [
        {"lineage":"P.3","66T":3.3,"241T":3.3,"3037T":3.3,"4926G":3.3,"5574G":3.3,"7564A":3.3},
        {"lineage":"B.1.1.7","22G":0.9,"241T":2.6,"913T":2.6,"1967G":0.9,"2721T":0.9,"3037T":},
        {"lineage":"C.37","175C":3,"241T":3,"3037T":3,"4002T":3,"7124T":3,"7424G":3,"8655T":3},
    ]
```
---------

### `/api` (work in progress)
* This endpoint provides the mutation frequency for specific lineages. It accepts query parameters of `lineage`, `mutation_type`, and `mutation_coordinate`. 
* `/api?lineage=BQ,XAJ,B.1.1.1` will serve the mutation frequencies for `BQ` (which expands into `B.1.1.529.5.3.1.1.1.1`), `XAJ` (which expands into `BA.2.12.1*` and `BA.4*`) will serve the mutation-frequencies of the specified `lineage`s of any mutation-type or mutation-coordinate.
* `/api?mutation_type=T,A` will serve the mutation-frequencies of all lineages with mutation-type `A` or `T`.
* `/api?mutation_coordinate=66,345,1345` will serve the mutation-frequencies of all lineages with mutations occuring at coordinates `66`,`345`, or `1345`. 
* `/api?lineage=BQ,XAJ&mutation_type=A,T&mutation_coordinate=66,367,1568` serves the mtation-frequencies of those specific lineages with mutations occuring at those specific coordinates of those specific mutation-types. 