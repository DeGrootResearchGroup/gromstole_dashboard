## Data Integrity
The data within the `data_test/` folder is only for testing purposes. To implement this `API` with real data, you should add your own `NC_045512.txt` and `example.json` within the `data` folder

When running the server in `test` mode, the `lineage_headers`, `mutation_headers`, and `sparse_frequencies` are saved in `frontend_test_data` folder. This could be used for running tests on the frontend without compromising data-security or policies. 

---------

## Pango Designation Table
The `PANGO` designation table was obtained from the [cov-lineages]("https://github.com/cov-lineages/pango-designation/blob/master/pango_designation/alias_key.json") project. 

---------

## Environment Variables
Create 3 separate `.env` files in the root directory of the NodeJS app and enslist them with the following environment variables
### `.env.test`
```
DATA_FOLDER="data_test"
NODE_PORT="8000"
NODE_ENV='TEST'
```
### `.env.dev`
```
DATA_FOLDER="data"
NODE_PORT="8000"
NODE_ENV='DEV'
```
### `.env.prod`
```
DATA_FOLDER="data"
NODE_PORT="8000"
NODE_ENV='PROD'
```

-----------

## Deployment

Default deployment environment is `DEV`

### To start `test` server
`npm run test`

### To start `development` server
`npm run dev`

### To start `production` server
`npm run prod`

-------------