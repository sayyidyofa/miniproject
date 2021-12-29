// Add utility/helper functions here
import { readFileSync } from 'fs';

export { checkRequired, checkErrorType, ipAddressChecker }

function checkErrorType(errorType){
    const rawData = readFileSync('./src/utils/error_type');
    const errorList = rawData.toString().split('\n')

    const stringifiedAddress = String(errorType)
    if (errorList.includes(stringifiedAddress)){
        console.log(`'${stringifiedAddress}' is defined`)
        return true
    } else{
        console.log(`error type '${stringifiedAddress}' is not defined`)
        return false
    }
}

function checkRequired(serviceType, address, timestamp){
    const required = [];
    if (!serviceType) {
        required.push("type");
    }
    if (!address) {
        required.push("from");
    }
    if (!timestamp) {
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
