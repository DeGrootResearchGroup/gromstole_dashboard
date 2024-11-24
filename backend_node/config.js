var $NODE_PORT;
var $DATA_FOLDER;
var $NODE_ENV;
var $FRONTEND_TESTDATA_DIR;

$NODE_ENV = process.env.NODE_ENV;

if($NODE_ENV == 'TEST')
{
    require('dotenv').config({ path: '.env.test' });
}
else if($NODE_ENV == 'PROD')
{
    require('dotenv').config({ path: '.env.prod' });
}
else
{
    $NODE_ENV = 'DEV';
    require('dotenv').config({ path: '.env.dev' });
}

$NODE_PORT = process.env.NODE_PORT;
$DATA_FOLDER = process.env.DATA_FOLDER;
$FRONTEND_TESTDATA_DIR = process.env.FRONTEND_TESTDATA_DIR;

if(!$DATA_FOLDER)
{
    console.warn(`.env.${$NODE_ENV.toLocaleLowerCase()} is missing DATA_FOLDER. Defaulting to "data"`);
    $DATA_FOLDER = 'data';
}
if(!$NODE_ENV)
{
    console.warn(`.env.${$NODE_ENV.toLocaleLowerCase()} is missing NODE_ENV. Defaulting to "dev"`);
    $NODE_ENV = 'dev';
}
if(!$NODE_PORT)
{
    console.warn(`.env.${$NODE_ENV.toLocaleLowerCase()} is missing NODE_PORT. Defaulting to "8000"`);
    $NODE_PORT="8000"
}

if($NODE_ENV=='TEST' && !$FRONTEND_TESTDATA_DIR)
{
    console.warn(`.env.${$NODE_ENV.toLocaleLowerCase()} is missing FRONTEND_TESTDATA_DIR. Defaulting to "frontend_testdata_dir"`);
    $FRONTEND_TESTDATA_DIR="frontend_testdata_dir"
}

const $RESPONSE_HEADERS = {
	"Access-Control-Allow-Methods": "*",
};

if($NODE_ENV==="DEV" || $NODE_ENV==="TEST" || $NODE_ENV==="PROD")
{
	$RESPONSE_HEADERS["Access-Control-Allow-Origin"] = "*",
    $RESPONSE_HEADERS["Access-Control-Allow-Headers"] = "Content-Type, Content-Encoding, start, limit, frequency, lineages, sublineages, mutations, dates, sort_column, sort_direction",
	$RESPONSE_HEADERS["Access-Control-Max-Age"] = 2592000
}

module.exports = {
    $DATA_FOLDER,
    $NODE_PORT,
    $NODE_ENV,
    $FRONTEND_TESTDATA_DIR,
    $RESPONSE_HEADERS
};

