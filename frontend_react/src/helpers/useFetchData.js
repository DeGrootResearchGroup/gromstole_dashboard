/** This is a custom Hook */

import { useState,useEffect } from "react";

function useFetchData(url, defaultValue=[]){
    const [data,setData] = useState(defaultValue)
    const [loading,setIsLoading] = useState(true);
    useEffect(()=>{
        if (!url) return;
        setIsLoading(true);
        setData(defaultValue);

        fetch(url)
        .then((res)=>{
            if(res.ok){return res.json()}
            else{throw(new Error('error',res.status))}
        })
        .then((newData)=>{
            setData(newData)
            setIsLoading(false)
        })
        .catch((error)=>{
            console.log('error while fetching',url,error)
        });

    },[url])

    return [data, loading]
}

export {useFetchData}