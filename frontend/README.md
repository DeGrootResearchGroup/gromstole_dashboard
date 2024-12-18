> [!NOTE]  
> This fork aims to expand upon [Tesselo](https://github.com/PoonLab/Tesselo) to specifically interface with the backend Flask API of `gromstole_dashboard`

> [!NOTE]  
> The documentation below is preserved from the original Tesselo repository for archiving purposes. For instructions on installations/usage, refer to the main [README](https://github.com/DeGrootResearchGroup/gromstole_dashboard/README.md) 

> [!WARNING]  
> Do not merge this fork back into the [upstream repo of PoonLab](https://github.com/PoonLab/Tesselo)



# Tesselo

## Dependencies
* [Python](https://www.python.org/)
* [Node](https://nodejs.org/en/download/) >= 16.0.0
* [npm](https://docs.npmjs.com/about-npm-versions) >= 5.6

## Installation
1. Clone the Tesselo Repository

```
git clone https://github.com/PoonLab/Tesselo.git
```

2. Install the required packages for the backend server

```
cd Tesselo/backend_node/
npm install
```

3. Install the required packages for the frontend

```
cd Tesselo/frontend_react/
npm install
```

## Usage

First, start the backend server in development mode. Navigate to the `backend_node` directory and run the following command:
```
npm run dev
```

Then start the React application. Navigate to the `frontend_react` directory and run the following command:
```
npm run start
```
