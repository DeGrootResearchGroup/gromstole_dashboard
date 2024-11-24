import { useEffect, useState } from 'react';
import Dropdown from './Dropdown';
import "../../../StyleSheets/FilterLineages.css"

const {gatherChildren} = require("./util")

const MenuItem = ({
    itemNumber,
    menuItem,
    depthLevel,
    setLineages,
    selection
}) => {
    const [dropdownActive,setDropdownActive] = useState(false)
    return (
        <li className='menuItem' data-testid={`menuItem-${menuItem.value}`}>
            {Object.keys(menuItem.children).length ? 
            (
            <div
                onMouseMove={()=>setDropdownActive(true)}
                onMouseLeave={()=>setDropdownActive(false)}
            >
                <div className='menuItem-dropdown' onClick={()=> {setLineages(gatherChildren(menuItem,[menuItem.children])); selection(menuItem.value)}}>
                    <span>{menuItem.value}</span>
                    <span>{"\u21E8"}</span>
                </div>
                <Dropdown 
                    itemNumber={itemNumber}
                    subMenu={menuItem.children}
                    dropdownActive={dropdownActive}
                    depthLevel = {depthLevel+1}
                    setLineages = {setLineages}
                    selection = {selection}
                />
            </div>
            )
            :
            (
                <div onClick={()=>{setLineages([menuItem.value]); selection(menuItem.value)}}>
                    {menuItem.value}
                </div>
            )
            }
        </li>
    );
};
export default MenuItem;