import argparse
import os
import re
import math 

DEFAULTS = {
    "YEAR_MIN"      : 2014,
    "YEAR_MAX"      : 2025,
    "EPIWEEK_MIN"   : 1,
    "EPIWEEK_MAX"   : 52,
    "COORD_MIN"     : 32,
    "COORD_MAX"     : 27578123,
    "FREQ_MIN"      : 0.0,
    "FREQ_MAX"      : 1.0,
    "REGIONS"       :["Toronto","Central East","Pearson","Unkown","North East","South West","Central West","East"],
    "PAGE"          : 0,
    "LIMIT"         : 500,
}

def parse_args():
    parser = argparse.ArgumentParser(description="Populate database with gromstole results.")

    parser.add_argument('--dbname',     type=str,   default=os.getenv("POSTGRES_DB",        "gromstole_db"),    help="Postgresql database name")
    parser.add_argument('--dbhost',     type=str,   default=os.getenv("POSTGRES_HOST",      "localhost"),       help="Postgresql database host address")
    parser.add_argument('--dbport',     type=str,   default=os.getenv("POSTGRES_PORT",      "5432"),            help="Connection to port number")
    parser.add_argument('--dbuser',     type=str,   default=os.getenv("POSTGRES_USER",      "myuser"),          help="Postgresl user")
    parser.add_argument('--dbpswd',     type=str,   default=os.getenv("POSTGRES_PASSWORD",  "mypassword"),      help="Postgresl password")
    
    args,unknown = parser.parse_known_args()
    return args

def validate_regions(regions:str)->list[str]|None:
    if(regions == None): return None
    regions = regions.replace("'", "").replace('"', "") # remove all single-quotes and double-quotes
    if(regions.strip() == ""): return None
    regions = regions.split(",")
    if(regions == []): return None
    return regions

def strip_digits(s:str)->int|float|None:
    """ a helper function used by other validate_* function """
    if(s == None): return None
    pattern = r'\b\d+\.\d+|\b\d+\b'
    # pattern = r'\d+'
    l = re.findall(pattern,s)
    if(l == []): return None
    elif('.' in l[0]): return (float)(l[0])
    else: return (int)(l[0])

def validate_dateRange(dateRangeString:str|None)->tuple[int,int,int,int]:
    """ 
        validate dateRange string 
        check that it has the format of 'YYYY-WW,YYYY-WW'
    """
    print("VALIDATING ",dateRangeString)

    yearStart       =   DEFAULTS['YEAR_MIN']
    yearEnd         =   DEFAULTS['YEAR_MAX']
    epiweekStart    =   DEFAULTS['EPIWEEK_MIN']
    epiweekEnd      =   DEFAULTS['EPIWEEK_MAX']

    if(dateRangeString is None): 
        return [yearStart,yearEnd,epiweekStart,epiweekEnd]
    
    dateRange = re.findall(r'(\d\d\d\d)-(\d\d),(\d\d\d\d)-(\d\d)',dateRangeString)
    if(dateRange == None or len(dateRange) != 1):
        return [yearStart,yearEnd,epiweekStart,epiweekEnd]

    if(dateRange[0] == None or len(dateRange[0]) != 4):
        return [yearStart,yearEnd,epiweekStart,epiweekEnd]

    yearStart       = (int)(dateRange[0][0])
    epiweekStart    = (int)(dateRange[0][1])
    yearEnd         = (int)(dateRange[0][2])
    epiweekEnd      = (int)(dateRange[0][3])

    return [yearStart,epiweekStart,yearEnd,epiweekEnd]
    
def validate_mutation(mutation:str)->list[str] | None:
    if(mutation == None) : return None
    mutation = mutation.replace("'", "").replace('"', "") # remove all single-quotes and double-quotes
    if(mutation.strip() == ""): return None
    if(mutation.split(",")==[]): return None
    
    mutation = mutation.split(",")
    for i in range(len(mutation)):
        if  (mutation[i] == "ins"): mutation[i]= "+"
        elif(mutation[i] == "del"): mutation[i]= "-"
        elif(mutation[i] == "sub"): mutation[i]= "~"
        else: mutation.remove(mutation[i])
    return mutation

def validate_coordinate(coordStart:str,coordEnd:str)->tuple[float,float] | tuple[None,None]:
    coordStart  = strip_digits(coordStart)
    coordEnd    = strip_digits(coordEnd)

    if(coordStart == None and coordEnd == None): return (None,None)

    if(coordStart == None): coordStart = DEFAULTS["COORD_MIN"]
    if(coordEnd == None):   coordEnd = DEFAULTS["COORD_MAX"]

    coordStart = (float)(coordStart)
    coordEnd = (float)(coordEnd)

    # swap coordStart,coordEnd if required
    if(coordStart > coordEnd): (coordStart,coordEnd) = (coordEnd,coordStart)

    return (coordStart,coordEnd)

def validate_frequency(freqStart:str,freqEnd:str)->tuple[float,float] | tuple[None,None]:
    freqStart  = strip_digits(freqStart)
    freqEnd    = strip_digits(freqEnd)

    if(freqStart == None and freqEnd == None): return (None,None)
    
    if(freqStart == None): freqStart = DEFAULTS["FREQ_MIN"]
    if(freqEnd == None): freqEnd = DEFAULTS["FREQ_MAX"]

    # swap freqStart,freqEnd if required
    freqStart = (float)(freqStart)
    freqEnd = (float)(freqEnd)
    if(freqStart > freqEnd): (freqStart,freqEnd) = (freqEnd,freqStart)

    return (freqStart/100,freqEnd/100) # convert frequencies from decimals to percentages

def validate_page(page : str) -> int | None:
    p = strip_digits(page)
    if(p == None) : return None
    p = math.floor(float(p))
    return p
