import React from "react";
import { useEffect, useState } from "react";
import Stack from '@mui/material/Stack';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormHelperText from '@mui/material/FormHelperText';

export function FilterDates({setDates, autofill}){

    const [date_one, setDateOne] = useState(new Date('2019-12-01'));
    const [date_two, setDateTwo] = useState(new Date());

    useEffect(()=>{
        // setDates(_g_lineage_headers.filter(lineage => {
        //     return (date_one <= new Date(_g_lineage_dates[lineage][1])) && (date_two >= new Date(_g_lineage_dates[lineage][1]));
        // }));
        setDates([new Date(date_one), new Date(date_two)])
    },[date_one,date_two, setDates])

    return (
        <div className="FilterBar__item">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={2} direction="row" justifyContent="center">
                    <DatePicker 
                        format="YYYY-MM-DD"
                        label="From" 
                        value={dayjs(date_one)}
                        onChange={(date) => {setDateOne(date)}}
                        maxDate={dayjs(date_two)}
                    />
                    <DatePicker
                        format="YYYY-MM-DD"
                        label="To" 
                        value={dayjs(date_two)}
                        onChange={(date) => {setDateTwo(date)}}
                        minDate={dayjs(date_one)}
                    />
                </Stack>
                <FormHelperText>{date_one > date_two ? 'Start date must be before end date.' : ' '}</FormHelperText>
            </LocalizationProvider>
        </div>
    )
}
