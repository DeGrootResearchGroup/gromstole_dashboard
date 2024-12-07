# Gromstole Dashboard
Gromstole Dashboard is a web-server and dashboard for analysis/visualization of frequency of SARS-CoV-2 genomic detected in wastewater samples. 

It is based on two independant softwares 
* [Gromstole](https://github.com/PoonLab/gromstole) for the backend web-server
* [Tesselo](https://github.com/PoonLab/Tesselo) for the frontend data-visualization

## Dependencies
* Backend web-server
    * [Python](https://www.python.org/)
    * [Python-dotenv](https://pypi.org/project/python-dotenv/)
    * [Flask](https://www.python.org/)
    * [Flask-Cors](https://pypi.org/project/Flask-Cors/)
    * [psycopg2](https://pypi.org/project/psycopg2/) 
    * [PostgreSQL](https://www.postgresql.org/download/)
* Frontend dashboard
    * [React](https://react.dev/learn/installation) >= 18.2.0
    * [Node](https://nodejs.org/en/download/) >= 16.0.0
    * [npm](https://docs.npmjs.com/about-npm-versions) >= 5.6

## Installation
1. Clone the `gromstole_dashboard` Repository

```
git clone https://github.com/DeGrootResearchGroup/gromstole_dashboard
```

2. Install the required packages for the backend server

```
cd gromstole_dashboard/backend/
pip3 install -r requirements.txt
```

3. Install the required packages for the frontend

```
cd gromstole_dashboard/frontend/frontend_react/
npm install
```

## Environment Variables
The backend web-server and frontend dashboard require specific environment variables to be established at runtime. 

The backend environment variables are expected in a text-file at `gromstole_dashboard/backend/.env`. 
```        
# POSTGRES-SQL CONNECTION
POSTGRES_DB       = "gromstole_db"
POSTGRES_HOST     = "localhost"
POSTGRES_PORT     = "5432"
POSTGRES_USER     = "myuser"
POSTGRES_PASSWORD = "mypassword"
```

The frontend environment variables are expected in a text-file at `gromstole_dashboard/frontend/frontend_react/.env`. 
```        
REACT_APP_API_DEVELOPMENT_URL           = "http://localhost:8000"
REACT_APP_API_TEST_URL                  = "https://example.com:8000"
REACT_APP_API_PRODUCTION_URL            = "https://example2.com:8000"
REACT_APP_API_MUTATION_HEADERS_ENDPOINT = "/mutation_headers"
REACT_APP_API_DATE_HEADERS_ENDPOINT     = "/date_headers"
REACT_APP_API_DEFAULTS_ENDPOINT         = "/defaults"
REACT_APP_API_SPARSE_MATRIX_ENDPOINT    = "/sparse_frequencies"
REACT_APP_API_FILTER_ENDPOINT           = "/filter"
REACT_APP_API_CSV_ENDPOINT              = "/csv"
REACT_APP_REACT_ENV                     = "DEVELOPMENT"     # to be used in development environment
# REACT_APP_REACT_ENV                   = "TEST"            # to be used in testing environment
# REACT_APP_REACT_ENV                   = "PRODUCTION"      # to be used in production environment
```

## Usage

First, start the backend server in development mode. Navigate to the `backend` directory and run the following command:
```
flask run --port 8000
```

Then start the React application. Navigate to the `frontend/frontend_react` directory and run the following command:
```
npm run start
```
