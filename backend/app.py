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
    query = "SELECT CAST(REGEXP_REPLACE(nuc, '[\~,\-,\+,A,T,G,C]', '', 'g') AS FLOAT) AS coord FROM AGGREGATE_MAPPED ORDER BY coord ASC LIMIT 1"
    cursor.execute(query)
    min_coord = cursor.fetchall()[0]['coord']

    # get the max value for coord
    query = "SELECT CAST(REGEXP_REPLACE(nuc, '[\~,\-,\+,A,T,G,C]', '', 'g') AS FLOAT) AS coord FROM AGGREGATE_MAPPED ORDER BY coord DESC LIMIT 1"
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


# return col headers i.e array of all dates
@app.route("/date_headers", methods=['GET'])
def date_headers():
    # spawn a new cursor to avoid race-conditions
    cursor = connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    
    # find the min year, min epiepiweek
    query = "SELECT CAST(year AS INTEGER),CAST(epiweek AS INTEGER) FROM AGGREGATE_MAPPED ORDER BY CAST(year AS INTEGER) ASC, CAST(epiweek AS INTEGER) ASC LIMIT 1"
    cursor.execute(query)
    min_year_epiweek = dict(cursor.fetchall()[0])

    # find the max year, max epiepiweek
    query = "SELECT CAST(year AS INTEGER),CAST(epiweek AS INTEGER) FROM AGGREGATE_MAPPED ORDER BY CAST(year AS INTEGER) DESC, CAST(epiweek AS INTEGER) DESC LIMIT 1"
    cursor.execute(query)
    max_year_epiweek = dict(cursor.fetchall()[0])

    minYear = (int)(min_year_epiweek['year'])
    maxYear = (int)(max_year_epiweek['year'])
    minEpiweek = (int)(min_year_epiweek['epiweek'])
    maxEpiweek = (int)(max_year_epiweek['epiweek'])

    # generate array of year-week values 
    result = []
    for year in range(minYear, maxYear + 1):
        # Determine the range of weeks for the current year
        week_start = minYear if year == minYear else 1
        week_end = maxEpiweek if year == maxEpiweek else 52
        
        # Add each "year-week" combination to the result
        for week in range(minEpiweek, maxEpiweek + 1):
            result.append(f"{year}-{week:02}")

    return jsonify(result)

# return row headers i.e array of all mutation
@app.route("/mutation_headers", methods=['GET'])
def mutation_headers():
    # spawn a new cursor to avoid race-conditions
    cursor = connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    
    query = "SELECT DISTINCT ON (CAST(REGEXP_REPLACE(nuc, '[~\-+ATGC]', '', 'g') AS FLOAT)) nuc"
    query += " FROM AGGREGATE_MAPPED"
    query += " ORDER BY CAST(REGEXP_REPLACE(nuc, '[~\-+ATGC]', '', 'g') AS FLOAT);"

    cursor.execute(query)
    distinct_mutations = []
    for row in cursor.fetchall():
        distinct_mutations.append(row['nuc'])

    return jsonify(distinct_mutations)


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
        query += f" AND CAST(REGEXP_REPLACE(nuc, '[\~,\-,\+,A,T,G,C]', '', 'g') AS FLOAT) BETWEEN {coordStart} AND {coordEnd}"

    if(freqStart != None and freqEnd != None):
        query += f" AND CAST(coverage AS FLOAT) <> 0.0 AND (CAST(count AS FLOAT) / CAST(coverage AS FLOAT)) BETWEEN {freqStart} AND {freqEnd}"

    offset = 0
    limit = DEFAULTS["LIMIT"]
    if(page != None): offset = limit * page
    query += " ORDER BY CAST(REGEXP_REPLACE(nuc, '[\~,\-,\+,A,T,G,C]', '', 'g') AS FLOAT)"
    query += f" LIMIT {limit} OFFSET {offset} "
    
    # spawn a new cursor to avoid race-conditions
    cursor = connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    cursor.execute(query)
    results = cursor.fetchall()

    tempMatrix = {} 
    matrix = []
    '''
        tempMatrix looks like 
        {
            '~123T' : {
                '2012-09' : { frequency:1.1, count:31 },
                '2012-10' : { frequency:3.1, count:54 },
                '2012-11' : { frequency:1.4, count:21 },
            },
            '-456A' : {
                '2012-09' : { frequency:2.5, count:15 },
                '2012-10' : { frequency:1.6, count:69 },
                '2012-11' : { frequency:6.3, count:25 },
            },
        }
        matrix looks like
        [
            {
                mutation: '~123T', 
                "2012-09":{ frequency:1.1, count:31 },
                "2012-10":{ frequency:3.1, count:54 },
                "2012-11":{ frequency:1.4, count:21 }
            },
            {
                mutation: '~456A', 
                '2012-09' : { frequency:2.5, count:15 },
                '2012-10' : { frequency:1.6, count:69 },
                '2012-11' : { frequency:6.3, count:25 },
            },
        ]
    '''

    cols = set([]) # a list of all the year-week strings -- convert this to a set
    for i in range(len(results)):
        year = results[i]['year']
        epiweek = results[i]['epiweek']
        iDateStr = year + '-' + epiweek
        cols.add(iDateStr)
        iFreq = round(100 * results[i]['count']/results[i]['coverage'],2)
        iCount = results[i]['count']
        iNuc = results[i]['nuc']
        if(tempMatrix.get(iNuc) == None):
            tempMatrix[iNuc] = {}
        tempMatrix[iNuc][iDateStr] = {'frequency':iFreq,'count':iCount}
    cols = list(cols)
    cols = sorted(cols, key=lambda x: (int(x.split('-')[0]), int(x.split('-')[1]))) # date columns must be sorted

# Convert tempMatrix into matrix
    muts = tempMatrix.keys()
    for m in muts:
        data = {}
        data['mutation'] = m
        dates = tempMatrix[m].keys()
        # dates = sorted(dates, key=lambda x: (int(x.split('-')[0]), int(x.split('-')[1]))) # date columns must be sorted
        for d in dates:
            data[d] = tempMatrix[m][d]
        matrix.append(data)

    response = jsonify({'columns':cols, 'rows':matrix})
    return response