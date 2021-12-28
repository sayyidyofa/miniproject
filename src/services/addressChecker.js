// dummy list ip
const daftarIP = ['127','128','129']

function checkAddress(address){

    const stringifiedAddress = String(address)
    if (daftarIP.includes(stringifiedAddress)){
        console.log('ada, ip nya adalah', stringifiedAddress)
        return true
    } else{
        console.log('gaada, ip nya adalah', stringifiedAddress)
        return false
    }
} 

export default checkAddress