from flask import Flask,request,jsonify
from flask_cors import CORS

from dotenv import load_dotenv
import sys
from utils import DEFAULTS, parse_args,validate_regions,validate_yearStart_epiweekStart_yearEnd_epiweekEnd,validate_mutation,validate_coordinate,validate_frequency, validate_page

import psycopg2
import psycopg2.extras
from psycopg2 import sql

app = Flask(__name__)
CORS(app)

# initialize connection to database
load_dotenv()
args = parse_args()
print(args)

connection_parameters = {
    "host"      :   args.dbhost,
    "port"      :   args.dbport,
    "user"      :   args.dbuser,
    "password"  :   args.dbpswd,
    'dbname'    :   args.dbname,
}

connection = None
try:
    connection = psycopg2.connect(**connection_parameters)
except psycopg2.Error as e:
    print(f"Error initiating connection to database: {format(e)}")
    sys.exit()

print(cursor,connection)


"""
Query args:
    region                  : string, or comma-separated string. Ex: "", "east" , "east,west,north"
    yearStart,yearEnd       : integer. swap them around if yearStart > yearEnd
    epiweekStart,epiweekEnd : integer. swap them around if yearStart == yearEnd AND epiweekStart > epiweekEnd
    mutation                : string or comma-separated string. Ex: "", "sub", "ins,del"
    coordStart,coordEnd     : integers. swap them around if coordStart > coordEnd
    freqStart,freqEnd       : floats. swap them around if freqStart > freqEnd
    page                    : int. defaults to 0

    http://localhost:5000/filter?
        region="east,west,north"
        &mutation="ins,del"
        &yearStart=2023&yearEnd=2024
        &epiweekStart=1&epiweekEnd=3
        &coordStart=1345&coordEnd=1450
        &freqStart=0.56&freqEnd=0.87
        &page=3
"""

@app.route("/defaults", methods = ['GET'])
def defaults():
    """Get all the options for regions, the min-max value for year/week, the min-max values for coordinates"""
    
    # spawn a new cursor to avoid race-conditions
    cursor = connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)

    response = DEFAULTS
    
    # find all unique values for regions
    query = "SELECT DISTINCT region FROM AGGREGATE_MAPPED"
    cursor.execute(query)
    distinct_regions = [row['region'] for row in cursor.fetchall()]

    # find the min year, min epiepiweek
    query = "SELECT CAST(year AS INTEGER),CAST(epiweek AS INTEGER) FROM AGGREGATE_MAPPED ORDER BY CAST(year AS INTEGER) ASC, CAST(epiweek AS INTEGER) ASC LIMIT 1"
    cursor.execute(query)
    min_year_epiweek = dict(cursor.fetchall()[0])

    # find the max year, max epiepiweek
    query = "SELECT CAST(year AS INTEGER),CAST(epiweek AS INTEGER) FROM AGGREGATE_MAPPED ORDER BY CAST(year AS INTEGER) DESC, CAST(epiweek AS INTEGER) DESC LIMIT 1"
    cursor.execute(query)
    max_year_epiweek = dict(cursor.fetchall()[0])
    
    # get the min value for coord
    query = "SELECT CAST(REGEXP_REPLACE(nuc, '[^0-9]', '', 'g') AS INTEGER) AS coord FROM AGGREGATE_MAPPED ORDER BY coord ASC LIMIT 1"
    cursor.execute(query)
    min_coord = cursor.fetchall()[0]['coord']

    # get the max value for coord
    query = "SELECT CAST(REGEXP_REPLACE(nuc, '[^0-9]', '', 'g') AS INTEGER) AS coord FROM AGGREGATE_MAPPED ORDER BY coord DESC LIMIT 1"
    cursor.execute(query)
    max_coord = cursor.fetchall()[0]['coord']

    response["YEAR_MIN"]        = min_year_epiweek['year'] 
    response["YEAR_MAX"]        = max_year_epiweek['year']
    response["EPIWEEK_MIN"]     = min_year_epiweek["epiweek"]
    response["EPIWEEK_MAX"]     = max_year_epiweek["epiweek"]
    response["COORD_MIN"]       = min_coord
    response["COORD_MAX"]       = max_coord
    response["REGIONS"]         = distinct_regions
    
    return jsonify(response)


@app.route("/filter", methods=['GET'])
def filter():
    region          = request.args.get("region") 
    yearStart       = request.args.get("yearStart")
    epiweekStart    = request.args.get("epiweekStart")
    yearEnd         = request.args.get("yearEnd")
    epiweekEnd      = request.args.get("epiweekEnd")
    mutation        = request.args.get("mutation")
    coordStart      = request.args.get("coordStart")
    coordEnd        = request.args.get("coordEnd")
    freqStart       = request.args.get("freqStart")
    freqEnd         = request.args.get("freqEnd")
    page            = request.args.get("page")
    
    # perform validation
    (yearStart,epiweekStart,yearEnd,epiweekEnd) = validate_yearStart_epiweekStart_yearEnd_epiweekEnd(yearStart,epiweekStart,yearEnd,epiweekEnd)
    region                                      = validate_regions(region)
    mutation                                    = validate_mutation(mutation)
    (coordStart,coordEnd)                       = validate_coordinate(coordStart,coordEnd)
    (freqStart,freqEnd)                         = validate_frequency(freqStart,freqEnd)
    page                                        = validate_page(page)

    # form query string
    query = "SELECT * FROM AGGREGATE_MAPPED"
    
    # always filtering by year so that subsequent query-params can always begin with an "AND"
    # query += f" WHERE year >= {yearStart} AND year <= {yearEnd} AND epiweek >= {epiweekStart} AND epiweek <= {epiweekEnd}"
    query += f" WHERE CAST(year AS INTEGER) >= {yearStart} AND CAST(year AS INTEGER) <= {yearEnd} AND CAST(epiweek AS INTEGER) >= {epiweekStart} AND CAST(epiweek AS INTEGER) <= {epiweekEnd}"

    if(region != None):
        query += " AND region in ("
        formatted_string = "'" + "','".join(region) + "'"  # comma separated regions with singlequotes
        query += formatted_string
        query += ")"
    
    if(mutation != None):
        formatted_string = " OR ".join([f"nuc LIKE '{mut}%'" for mut in mutation])
        query += " AND " + formatted_string

    if(coordStart != None and coordEnd != None):
        query += f" AND CAST(REGEXP_REPLACE(nuc, '[^0-9-]', '', 'g') AS INTEGER) BETWEEN {coordStart} AND {coordEnd}"

    if(freqStart != None and freqEnd != None):
        query += f" AND CAST(coverage AS FLOAT) <> 0.0 AND (CAST(count AS FLOAT) / CAST(coverage AS FLOAT)) BETWEEN {freqStart} AND {freqEnd}"

    offset = 0
    limit = DEFAULTS["LIMIT"]
    if(page != None): offset = limit * page
    query += f" LIMIT {limit} OFFSET {offset} "
    
    # spawn a new cursor to avoid race-conditions
    cursor = connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute(query)
    results = cursor.fetchall()
    return jsonify(results)