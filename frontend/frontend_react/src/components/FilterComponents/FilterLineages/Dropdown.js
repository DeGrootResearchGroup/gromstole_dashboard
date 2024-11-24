import MenuItem from "./MenuItem";

const Dropdown = ({
    subMenu,
    dropdownActive,
    parentValue,//this is used just for data-testid
    depthLevel,//this is used just for styling purposes. 
    itemNumber,//this is used just for styling purposes. 
    setLineages,
    selection
}) => {
    const dropdownStyle = {
        "cursor"            :"pointer",
        "position"          :'absolute',
        "backgroundColor"   :"white",
        "opacity"           :"0.9",
        "flexDirection"     :"column",
        "border"            : "1px solid red",
        "width"             : "100px",
        "margin"            : "0px",
        "padding"           : "2px",
        "listStyle"         : "none",
        "zIndex"            : 500 + depthLevel*100,
        "display"           : dropdownActive?'flex':'none',
        "left"              :(!depthLevel)?0:98,
        "top"               : (!itemNumber&&!depthLevel)?25:0,
    }
    return (
        <ul style={dropdownStyle} data-testid={`dropdown-${parentValue}`}>
            {Object.values(subMenu).map((menuItem,index)=>(
                <div key={index}>
                    <MenuItem
                        key={index} 
                        itemNumber={index}
                        menuItem={menuItem}
                        depthLevel={depthLevel}
                        setLineages={setLineages}
                        selection = {selection}
                        />
                </div>
            ))}
        </ul>
    );
};

export default Dropdown;