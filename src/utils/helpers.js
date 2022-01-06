// Add utility/helper functions here
import { readFileSync } from 'fs';

export { checkRequired, isAutoByErrorType, ipAddressChecker }

function isAutoByErrorType(errorType){
    const rawData = readFileSync('./src/utils/error_type');
    const errorList = rawData.toString().split('\n')

    const stringifiedErrorType = String(errorType)
    if (errorList.includes(stringifiedErrorType)){
        return true
    } else{
        return false
    }
}

function checkRequired(log){
    const required = [];
    if (!log.type) {
        required.push("type");
    }
    if (!log.service) {
        required.push("service");
    }
    if (!log.from) {
        required.push("from");
    }
    if (!log.timestamp) {
        required.push("timestamp");
    }
    return required
} 

function ipAddressChecker(ip) {
    let rawString = '';
    try {
        rawString = readFileSync('./inventory').toString();
    } catch (e) {
        console.error('inventory file not found!');
    }
    const ipAddresses = rawString.match(/(\d{1,3}[\.]){3}\d{1,3}/g) || [];

    return ipAddresses.includes(ip);
}
