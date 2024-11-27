const $API_DEVELOPMENT_URL          = process.env.REACT_APP_API_DEVELOPMENT_URL;
const $API_TEST_URL                 = process.env.REACT_APP_API_TEST_URL;
const $API_PRODUCTION_URL           = process.env.REACT_APP_API_PRODUCTION_URL;
const $REACT_ENV                    = process.env.REACT_APP_REACT_ENV;
const $MUTATION_HEADERS_ENDPOINT     = process.env.REACT_APP_API_MUTATION_HEADERS_ENDPOINT;
const $LINEAGE_TRIE_ENDPOINT     = process.env.REACT_APP_API_LINEAGE_TRIE_ENDPOINT;
const $DATE_HEADERS_ENDPOINT    = process.env.REACT_APP_API_DATE_HEADERS_ENDPOINT;
const $DEFAULTS_ENDPOINT    = process.env.REACT_APP_API_DEFAULTS_ENDPOINT;
const $SPARSE_MATRIX_ENDPOINT       = process.env.REACT_APP_API_SPARSE_MATRIX_ENDPOINT;
const $AA_CONTEXT_ENDPOINT         = process.env.REACT_APP_API_AA_CONTEXT_ENDPOINT;
const $LINEAGE_DATES_ENDPOINT      = process.env.REACT_APP_API_LINEAGE_DATES_ENDPOINT;
const $FILTER_ENDPOINT             = process.env.REACT_APP_API_FILTER_ENDPOINT;
const $SORT_ENDPOINT               = process.env.REACT_APP_API_SORT_ENDPOINT;
const $CSV_ENDPOINT                = process.env.REACT_APP_API_CSV_ENDPOINT;


if(!$API_DEVELOPMENT_URL)
    throw new Error(".env is missing REACT_APP_API_DEVELOPMENT_URL")

if(!$API_TEST_URL)
    throw new Error(".env is missing REACT_APP_API_TEST_URL")

if(!$API_PRODUCTION_URL)
    throw new Error(".env is missing REACT_APP_API_PRODUCTION_URL")

if(!$REACT_ENV)
    throw new Error(".env is missing REACT_APP_REACT_ENV")

if(!$MUTATION_HEADERS_ENDPOINT)
    throw new Error(".env is missing REACT_APP_MUTATION_HEADERS_ENDPOINT");

if(!$LINEAGE_TRIE_ENDPOINT)
    throw new Error(".env is missing REACT_APP_LINEAGE_TRIE_ENDPOINT");

if(!$DATE_HEADERS_ENDPOINT)
    throw new Error(".env is missing REACT_APP_API_DATE_HEADERS_ENDPOINT");

if(!$SPARSE_MATRIX_ENDPOINT)
    throw new Error(".env is missing REACT_APP_API_SPARSE_MATRIX_ENDPOINT");

if(!$AA_CONTEXT_ENDPOINT)
    throw new Error(".env is missing REACT_APP_API_AA_CONTEXT_ENDPOINT");

if(!$FILTER_ENDPOINT)
    throw new Error(".env is missing REACT_APP_API_FILTER_ENDPOINT");

if(!$SORT_ENDPOINT)
    throw new Error(".env is missing REACT_APP_API_SORT_ENDPOINT");
if(!$CSV_ENDPOINT )
    throw new Error(".env is missing REACT_APP_API_CSV_ENDPOINT");
if(!$LINEAGE_DATES_ENDPOINT )
    throw new Error(".env is missing REACT_APP_API_LINEAGE_DATES_ENDPOINT")
if(!$DEFAULTS_ENDPOINT)
    throw new Error(".env is missing REACT_APP_API_LINEAGE_DEFAULTS_ENDPOINT")

var $API_URL;

if($REACT_ENV==='DEVELOPMENT')
    $API_URL = $API_DEVELOPMENT_URL;
else if($REACT_ENV==='TEST')
    $API_URL = $API_TEST_URL;
else if($REACT_ENV==='PRODUCTION')
    $API_URL = $API_PRODUCTION_URL;
else
    throw new Error(".env REACT_ENV must be DEVELOPMENT, TEST, or PRODUCTION. Currently it is set to " + $REACT_ENV);

module.exports = {
    $API_URL,
    $MUTATION_HEADERS_ENDPOINT,
    $LINEAGE_TRIE_ENDPOINT,
    $DATE_HEADERS_ENDPOINT,
    $SPARSE_MATRIX_ENDPOINT,
    $AA_CONTEXT_ENDPOINT,
    $LINEAGE_DATES_ENDPOINT,
    $FILTER_ENDPOINT,
    $SORT_ENDPOINT,
    $CSV_ENDPOINT,
    $DEFAULTS_ENDPOINT
}