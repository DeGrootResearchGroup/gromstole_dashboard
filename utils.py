import argparse
import os
import re

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

def strip_digits(s:str)->int|None:
    """ a helper function used by other validate_* function """
    if(s == None): return None
    pattern = r'\b\d+\.\d+|\b\d+\b'
    # pattern = r'\d+'
    l = re.findall(pattern,s)
    if(l == []): return None
    return l[0]

def validate_yearStart_epiweekStart_yearEnd_epiweekEnd(yearStart:str,epiweekStart:str,yearEnd:str,epiweekEnd:str)->tuple[int,int,int,int] | tuple[None,None,None,None]:
    """ validate the year and week """

    yearStart       = strip_digits(yearStart)
    yearEnd         = strip_digits(yearEnd)
    epiweekStart    = strip_digits(epiweekStart)
    epiweekEnd      = strip_digits(epiweekEnd)

    if(yearStart    == None): yearStart     = DEFAULTS['YEAR_MIN']
    if(yearEnd      == None): yearEnd       = DEFAULTS['YEAR_MAX']
    if(epiweekStart == None): epiweekStart  = DEFAULTS['EPIWEEK_MIN']
    if(epiweekEnd   == None): epiweekEnd    = DEFAULTS['EPIWEEK_MAX']

    # swap yearStart,yearEnd if required
    if(yearStart > yearEnd): (yearStart,yearEnd) = (yearEnd,yearStart)
    
    # swap epiweekStart,epiweekEnd if required
    if(yearStart == yearEnd and epiweekStart > epiweekEnd): (epiweekStart,epiweekEnd) = (epiweekEnd,epiweekStart)
    
    return (yearStart,epiweekStart,yearEnd,epiweekEnd)


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

def validate_coordinate(coordStart:str,coordEnd:str)->tuple[int,int] | tuple[None,None]:
    coordStart  = strip_digits(coordStart)
    coordEnd    = strip_digits(coordEnd)

    if(coordStart == None and coordEnd == None): return (None,None)

    if(coordStart == None): coordStart = DEFAULTS["COORD_MIN"]
    if(coordEnd == None):   coordEnd = DEFAULTS["COORD_MAX"]

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
    if(freqStart > freqEnd): (freqStart,freqEnd) = (freqEnd,freqStart)

    return (freqStart,freqEnd)