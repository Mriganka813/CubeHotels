
const nights = document.getElementById('night')
const stayDay = document.getElementById('stayDay')
const basePrice = document.getElementById('baseprice')


// Get the Check-Out date input element
function countDays() {
    let diff = 0
    const price = document.getElementById('priceNight').value
    const checkOutInput = document.getElementById('checkOutDate').value;
    const checkInDate = document.getElementById('checkInDate').innerText
    const cout = document.getElementById('cout')

    if (checkOutInput && checkInDate) {
        const checkOutDateObj = new Date(checkOutInput);
        const checkInDateObj = new Date(checkInDate);

        const timeDifference = checkOutDateObj - checkInDateObj;
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

        console.log(`Number of days difference: ${daysDifference}`);
        nights.value = daysDifference
        stayDay.value = daysDifference
        diff = daysDifference
        cout.value = checkInDate

    }
    // console.log(price);
    const totalPrice = diff * price
    // console.log(totalPrice);
    basePrice.value = totalPrice
}

function addDiscount() {

    const disc = document.getElementById('discount').value
    const setDisc = document.getElementById('disc')
    setDisc.value = disc
}

function addServiceCharges() {

    const charge = document.getElementById('charge').value
    const setCharge = document.getElementById('service')
    setCharge.value = charge
}

function checkinTime(){
    const time = document.getElementById('cinTime').value
    const setTime = document.getElementById('setTime')

    setTime.value = time
}

function calculateNet() {
    // console.log('cc');
    const rent = parseInt(document.getElementById('baseprice').value);
    const discount = parseInt(document.getElementById('disc').value);
    const advance = parseInt(document.getElementById('advance').value);
    const charge = parseInt(document.getElementById('service').value);
    const gst = parseFloat(document.getElementById('gst').value);

    const gstAmt = (rent - discount) * gst/100

    console.log(typeof (rent) , "rent");
    const netPrice = document.getElementById('net')
    const net = (rent + charge + gstAmt ) - advance - discount
    console.log(net);
    netPrice.value = net
    

}