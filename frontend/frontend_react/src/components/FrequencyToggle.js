import Switch from '@mui/material/Switch';
import React, { useState } from "react";
import { useContext } from 'react';
import { GlobalFilterContext } from "../GlobalFilterContext";

export function FrequencyToggle() {

  let setToggle = useContext(GlobalFilterContext).setToggle
  let toggle = useContext(GlobalFilterContext).frequency_toggle

  return (
    <div className="FrequencyToggle">
      <span>Value</span>
      <label>
        <Switch onChange={() => {setToggle(!toggle) }} defaultChecked={true}> </Switch>
      </label>
    </div>
  );
}
