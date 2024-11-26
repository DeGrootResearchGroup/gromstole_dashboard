import React, { useContext, useEffect, useState, useRef, useMemo  } from 'react';
import { FixedSizeList as List } from 'react-window';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
// import '../../StyleSheets/CollapsedTable.css'; // Importing external CSS for hover and border effects
import { GlobalDataContext } from "../../GlobalDataContext";
import { GlobalFilterContext } from "../../GlobalFilterContext";
import { $API_URL, $SPARSE_MATRIX_ENDPOINT, $FILTER_ENDPOINT, $SORT_ENDPOINT, $CSV_ENDPOINT} from "../../config";
import { VariableSizeGrid as Grid } from "react-window";
import colors from "../../helpers/SetColourGradient";

const ROW_HEIGHT = 48; // Height of each row

const largeDataSet = new Array(1000).fill(0).map((_, rowIndex) => {
  const row = {};
  for (let colIndex = 0; colIndex < 300; colIndex++) {
    row[`Column ${colIndex + 1}`] = `Row ${rowIndex + 1} Col ${colIndex + 1}`;
  }
  return row;
});

// Function to determine cell color based on specific logic
const getCellColor = (rowIndex, columnIndex, frequency) => {
  if (rowIndex === 0) return "lightgrey";
  if (columnIndex === 0) return "lightgrey";
  return colors(frequency);
};

// function getColumns(filtered_headers) {
//   let col1 = {"key":"lineage","name":"","width": 200, 'frozen':true, 'label':'lineage', 'resizable': true }

//   let count = {};

//   return [col1, ...filtered_headers.map((e)=> {

//     let new_name, c;

//     // Reformat insertions in the heading such that it ends in the length of the insertion, indexed
//     // i.e. insAGC becomes ins3-0
//     if (e.includes('ins')) {
//       new_name = e.match(/^(.*?)\ins/)[0] + e.replace(/^(.*?)\ins/, "").length
//       c = new_name in count ? count[new_name] = count[new_name] + 1 : count[new_name] = 0;
//     }
//     return {
//         'key':e,
//         'name': new_name ? new_name + '-' + c: e,
//         'label': e,
//         formatter:ColorBoxFormatter,
//         sortable:true
//     }

//   })]
// }

export default function CollapsedTable() {

  const cell_height = 30;
  const [columns,setColumns] = useState([]);
  const {_g_mutation_headers} = useContext(GlobalDataContext);
  const {filter__frequencies,filter__lineages, filter__mutations,filter__coordinates, filter__dates, current_data, setCurrentData, filter__sublineage, filter__reset, setFilter__reset} = useContext(GlobalFilterContext);
  const [sortColumns, setSortColumns] = useState();

  const url_load = $API_URL + $SPARSE_MATRIX_ENDPOINT;
  const url_filter = $API_URL + $FILTER_ENDPOINT;
  const limit = window.innerHeight/cell_height; 
  const [start, setStart] = useState(0);
  const containerRef = useRef(null);
  const [prevScrollVertical, setPrevScrollVertical] = useState(0);
  const [filtered_headers, setFiltered_headers] = useState(_g_mutation_headers);
  const [isLoading, setIsLoading] = useState(false);
  const [noOfRender, setNoOfRender] = useState(0);

  const [hiddenColumns, setHiddenColumns] = useState({});
  const [columnWidths, setColumnWidths] = useState(Array(300).fill(25));
  const gridRef = useRef();
  const [columnNames, setColumnNames] = useState([]);

  const toggleColumn = (colName, index) => {
    setHiddenColumns((prev) => {
      const newHiddenColumns = {
        ...prev,
        [colName]: !prev[colName],
      };

      // Update column widths based on visibility
      const newColumnWidths = [...columnWidths];
      newColumnWidths[index] = newHiddenColumns[colName] ? 25 : 100; 

      setColumnWidths(newColumnWidths);
      
      // Reset the grid to recalculate column widths
      if (gridRef.current) {
        gridRef.current.resetAfterIndices({
          columnIndex: 0,
          rowIndex: 0,
          shouldForceUpdate: true
        });
      }

      return newHiddenColumns;
    });
  };

  // Row height function to handle header height
  const getRowHeight = (index) => (index === 0 ? 50 : 35); // Make header row taller


  useEffect(() => {
    if(!filter__frequencies || !filter__frequencies.length || !filter__mutations.length || !filter__mutations) return;
    if (filter__reset) {
      setStart(0);
      setCurrentData([]);
      setPrevScrollVertical(0);
      setFilter__reset(false);
      return;
    }
    if (noOfRender === 0) {
      setNoOfRender(1);
      return;
    }
    
    // Perform filtering in the backend 
    async function filter() {
      await fetch(url_filter, {
        // Pass the range of frequencies, mutation coordinates, dates and lineages
        headers: {
            frequency: filter__frequencies,
            lineages: filter__lineages,
            sublineages: filter__sublineage,
            mutations: filter__mutations,
            dates: filter__dates
        },
        })
        .then((res)=>{
            if(res.ok){return res.json()}
            else{throw(new Error('error',res.status))}
        })
        .then((newData)=>{
          console.log("FILTERING")
          setStart(limit);
          setPrevScrollVertical(0);
          setFiltered_headers(newData.columns);
          setCurrentData(newData.rows)
          setColumnNames(['mutation',...newData.columns], [newData.rows])

          setHiddenColumns(() => {
            let newHiddenColumns = {};

            for (let i = 0; i < newData.columns.length; i++) {
              newHiddenColumns[newData.columns[i]] = true;
            }
      
            // Update column widths based on visibility
            const newColumnWidths = [...columnWidths];
            newColumnWidths[0] = newHiddenColumns['mutation'] ? 25 : 100; 
            setColumnWidths(newColumnWidths);
            
            // Reset the grid to recalculate column widths
            if (gridRef.current) {
              gridRef.current.resetAfterIndices({
                columnIndex: 0,
                rowIndex: 0,
                shouldForceUpdate: true
              });
            }
      
            return newHiddenColumns;
          });

        })
        .catch((error)=>{
            console.log('error while fetching',url_filter,error)
        }); 
    }

    filter();
   
  },[filter__frequencies,filter__lineages, filter__mutations, filter__dates, filter__sublineage])


  return (
    current_data ? (
    <div style={{ width: "800px", height: "450px" }}>
      <Grid
        ref={gridRef} 
        columnCount={columnNames.length}
        columnWidth={(index) => columnWidths[index]} 
        height={800}
        rowCount={current_data.length + 1} // +1 for the header row
        rowHeight={getRowHeight}
        width={900}
      >
        {({ columnIndex, rowIndex, style }) => {
          const isHeader = rowIndex === 0;
          const isHidden = hiddenColumns[columnNames[columnIndex]];
          let cellColor;
          if (isHeader) {
            cellColor = getCellColor(rowIndex, columnIndex, 0); 
          }
          else {
            const freq = current_data[rowIndex - 1][columnNames[columnIndex]] ? current_data[rowIndex - 1][columnNames[columnIndex]]['frequency'] : 0
            cellColor = getCellColor(rowIndex, columnIndex, freq);
          }

          return (
            <div
              style={{
                ...style,
                top: isHeader ? style.top : style.top,
                background:  cellColor, 
                fontWeight: isHeader ? "bold" : "normal",
                borderBottom: "1px solid #ccc",
                borderRight: columnIndex === columnNames.length - 1 ? "none" : "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isHeader ? "pointer" : "default",
                boxSizing: "border-box",
              }}
              onClick={
                isHeader ? () => toggleColumn(columnNames[columnIndex], columnIndex) : undefined
              }
              title={
                isHeader
                  ? `Click arrow to ${isHidden ? 'show' : 'hide'} this column`
                  : undefined
              }
            >
              {isHeader ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  {isHidden ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleColumn(columnNames[columnIndex], columnIndex);
                      }}
                      style={{
                        cursor: "pointer",
                        transform: "rotate(90deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      ➤
                    </span>
                  ) : (
                    <>
                      <span>{columnNames[columnIndex]}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn(columnNames[columnIndex], columnIndex);
                        }}
                        style={{
                          marginLeft: "5px",
                          cursor: "pointer",
                          transform: "rotate(0deg)",
                          transition: "transform 0.3s ease",
                        }}
                      >
                        ➤
                      </span>
                    </>
                  )}
                </div>
              ) : isHidden ? (
                <div style={{ width: "100%", height: "100%", background: cellColor }} />
              ) : (
                current_data[rowIndex - 1][columnNames[columnIndex]] ? (columnIndex === 0 ? current_data[rowIndex - 1]['mutation'] : current_data[rowIndex - 1][columnNames[columnIndex]]['frequency']) : 0
              )}
            </div>
          );
        }}
      </Grid>
    </div>
    ) : <div>Loading</div>
  );
  
}



