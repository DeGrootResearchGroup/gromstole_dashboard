function gatherChildren(menuItem,results=[]){
    if(menuItem.exists)
        results.push(menuItem.value);
    
    Object.values(menuItem.children).forEach((cmi)=>{
        results.concat(gatherChildren(cmi,results))
    })
    
    return results;
}


module.exports = {gatherChildren}