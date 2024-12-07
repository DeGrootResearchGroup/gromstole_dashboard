# Gromstole Dashboard
Gromstole Dashboard is a web-server and dashboard for analysis/visualization of frequency of SARS-CoV-2 genomic detected in wastewater samples. 

It is based on two independant softwares 
* [Gromstole](https://github.com/PoonLab/gromstole) for the backend web-server
* [Tesselo](https://github.com/PoonLab/Tesselo) for the frontend data-visualization

## Dependencies
* [Python](https://www.python.org/)
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
npm install
```

3. Install the required packages for the frontend

```
cd gromstole_dashboard/frontend/frontend_react/
npm install
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
