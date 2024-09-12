import React from 'react';
import { Switch } from 'antd';
import callApi from '../../service/callApi';

function SwitchCustom({ checkend, apiEndPoint }) {

    function handleStatus(value) {
        callApi("patch", apiEndPoint, { status: value })
    }
    return (
        <>
            <Switch defaultChecked={checkend} onChange={handleStatus} />
        </>
    )
}
export default SwitchCustom;