import { GlobalDataContext } from "../GlobalDataContext";
import { GlobalFilterContext } from "../GlobalFilterContext";
import { useContext, useEffect, useState, useRef} from "react";
import { MyCell } from "../components/MyCell"
import DataGrid from "react-data-grid"
import 'react-data-grid/lib/styles.css';
import "../StyleSheets/Table.css"

import { $API_URL, $SPARSE_MATRIX_ENDPOINT, $FILTER_ENDPOINT, $SORT_ENDPOINT, $CSV_ENDPOINT} from "../config";


function ColorBoxFormatter(props){
    return (<MyCell props={props}/>);
};

function rowKeyGetter(row){
  return row.lineage
}

function getColumns(filtered_headers) {
    let col1 = {"key":"lineage","name":"","width": 200, 'frozen':true, 'label':'lineage', 'resizable': true }

    let count = {};

    return [col1, ...filtered_headers.map((e)=> {

      let new_name, c;

      // Reformat insertions in the heading such that it ends in the length of the insertion, indexed
      // i.e. insAGC becomes ins3-0
      if (e.includes('ins')) {
        new_name = e.match(/^(.*?)\ins/)[0] + e.replace(/^(.*?)\ins/, "").length
        c = new_name in count ? count[new_name] = count[new_name] + 1 : count[new_name] = 0;
      }
      return {
          'key':e,
          'name': new_name ? new_name + '-' + c: e,
          'label': e,
          formatter:ColorBoxFormatter,
          sortable:true
      }

    })]
  }

export function Table(){
    const cell_height = 30;
    const [columns,setColumns] = useState([]);
    const {_g_mutation_headers} = useContext(GlobalDataContext);
    const {filter__frequencies,filter__lineages, filter__mutations, filter__dates, current_data, setCurrentData, filter__sublineage, filter__reset, setFilter__reset} = useContext(GlobalFilterContext);
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

    // Upon first loading the webpage, this callback is triggered to fillup the table
    useEffect(()=>{
        if(!filtered_headers || !current_data) return;
        setColumns(getColumns(filtered_headers));
    },[])

    const isAtBottom = (currentTarget) => {
      return currentTarget.target.scrollTop + 10 >= currentTarget.target.scrollHeight - currentTarget.target.clientHeight;
    }
    
    // Handle boundaries for scrolling and fetching data
    async function handleScroll (event) {
      if (event.target.scrollTop == prevScrollVertical) {
        return;
      }
      setPrevScrollVertical(event.target.scrollTop);
      if (isLoading || !isAtBottom(event)) return;
      setIsLoading(true);
      const newRows = await fetchData();
      setIsLoading(false);
    }

    useEffect(() => {
      if(!filter__frequencies || !filter__frequencies.length || !filter__mutations.length || !filter__mutations) return;
      if (filter__reset) {
        setStart(0);
        setCurrentData([]);
        setColumns(getColumns(_g_mutation_headers));
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
            setColumns(getColumns(newData.columns));
          })
          .catch((error)=>{
              console.log('error while fetching',url_filter,error)
          }); 
      }

      filter();
     
    },[filter__frequencies,filter__lineages, filter__mutations, filter__dates, filter__sublineage])

    useEffect(() => {
      if (start === 0) {
        fetchData(); 
      }
    }, [start]);


    // Fetch a subset of the data from the backend
    async function fetchData() {
      await fetch(url_load, {
        headers: {
            // the start of the subset and how many new rows are fetched on each scroll
            start: start.toString(),
            limit: limit.toString(),
        },
      })
      .then((res)=>{
          if(res.ok){
            return res.json()
          }
          else{throw(new Error('error',res.status))}
      })
      .then((newData)=>{
          console.log("FETCHING DATA")
          setStart((prevStart) => prevStart + limit);
          setCurrentData((prevData) => [...prevData, ...newData]);
      })
      .catch((error)=>{
          console.log('error while fetching',url_load,error)
      });
    }

  function getComparator(sortColumn){
    return (a, b) => {
      if(!a[sortColumn]) return -1;
      if(!b[sortColumn]) return 1;
      if(a[sortColumn]['frequency'] < b[sortColumn]['frequency']) return -1; 
      if(a[sortColumn]['frequency']  > b[sortColumn]['frequency']) return 1; 
      return 0;
  }}

  useEffect(()=>{
    if(!sortColumns || !sortColumns.length) return;
    const sort_column = sortColumns[0].columnKey;
    const sort_direction = sortColumns[0].direction;
    const comparator = getComparator(sort_column);
    let new_sorted_matrix = [...current_data]
    new_sorted_matrix.sort((a,b)=>{
      const compResult = comparator(a,b);
      return sort_direction === 'ASC' ? compResult : -compResult;
    })
    setCurrentData(new_sorted_matrix);
  },[sortColumns])


    return(
      <div>
        <div className="Table" id="Table" data-testid={"Table"}>
          <DataGrid 
            ref={containerRef}
            rowKeyGetter={rowKeyGetter}
            rows={current_data}
            columns={columns} 
            rowsCount={current_data.length}
            rowHeight={cell_height}
            defaultColumnOptions={{sortable:true}}
            onSortColumnsChange = {setSortColumns}
            onScroll={(event)=>handleScroll(event)}
            sortColumns = {sortColumns}
          />
          {isLoading  && <div className="table-loading">Loading...</div>}
        </div>
      </div>
    )
}