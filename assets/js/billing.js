
const nights = document.getElementById('night')
const stayDay = document.getElementById('stayDay')
const basePrice = document.getElementById('baseprice')

function getSubtotal(){
    console.log('check');
    const stay = document.getElementById('stayDay')
    const price = parseInt(document.getElementById('priceNight').value)
    const basePrice = document.getElementById('baseprice')
    const day = parseInt(document.getElementById('night').value)
    
    basePrice.value = price * day
    stay.value = day
}

// Get the Check-Out date input element
function countDays() {
    let diff = 0
    const basePrice = document.getElementById('baseprice')
    const price = parseInt(document.getElementById('priceNight').value)
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
    const day = parseInt(document.getElementById('night').value)
    const totalPrice = day * price
    console.log(totalPrice);
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
    const price = parseInt(document.getElementById('priceNight').value);
    const day = parseInt(document.getElementById('night').value);
    const basePrice = document.getElementById('baseprice')
    const discount = parseInt(document.getElementById('disc').value);
    const advance = parseInt(document.getElementById('advance').value);
    const charge = parseInt(document.getElementById('service').value);
    const gst = parseFloat(document.getElementById('gst').value);
    
    const rent = price * day
    basePrice.value = rent
    const gstAmt = (rent) * gst/100

    console.log(typeof (rent) , "rent");
    const netPrice = document.getElementById('net')
    const net = (rent + charge + gstAmt ) - advance - discount
    console.log(net);
    netPrice.value = net
   
    

}