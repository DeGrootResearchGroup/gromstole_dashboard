import { GlobalDataContextProvider } from "./GlobalDataContext";
import { Dashboard } from './components/Dashboard';
import { GlobalFilterContextProvider } from "./GlobalFilterContext";
import { useContext, useEffect } from "react";

function App() {
  
  return (
    <div className="App">
      <GlobalDataContextProvider>
        <GlobalFilterContextProvider>
          <Dashboard />
        </GlobalFilterContextProvider>
      </GlobalDataContextProvider>
    </div>
  );
}

export default App;