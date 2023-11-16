
function updateNet() {
    const netAmount = document.getElementById('net');
    const gstPercent = parseFloat(document.getElementById('gst').value);
    const discount = parseFloat(document.getElementById('discount').value);
    const advance = parseFloat(document.getElementById('advance').value);
    const additional = parseFloat(document.getElementById('additional').value);
    const day = parseInt(document.getElementById('night').value);
    const price = parseFloat(document.getElementById('priceNight').value);
    const gstAmt = document.getElementById('gstAmt');
  
    // Check if parsed values are valid numbers
    if (isNaN(gstPercent) || isNaN(discount) || isNaN(advance) || isNaN(additional) || isNaN(day) || isNaN(price)) {
      console.error('Invalid input. Please enter valid numbers.');
      return;
    }
  
    const totalPrice = day * price;
    const gstAmount = totalPrice * gstPercent / 100;
  
    const net = (totalPrice + gstAmount + additional) - advance - discount;
    gstAmt.value = gstAmount.toFixed(2);
    netAmount.value = net.toFixed(2);
  }
  

// Get the Check-Out date input element
function countDays() {
    let diff = 0
    const stayDay = document.getElementById('stayDay')
    const basePrice = document.getElementById('baseprice')
    const price = parseInt(document.getElementById('priceNight').value)
    const checkOutInput = document.getElementById('checkOutDate').value;
    const checkInDate = document.getElementById('checkInDate').innerText
    const cout = document.getElementById('cout')
    const nights = document.getElementById('night')
    if (checkOutInput && checkInDate) {
        const checkOutDateObj = new Date(checkOutInput);
        const checkInDateObj = new Date(checkInDate);

        const timeDifference = checkOutDateObj - checkInDateObj;
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

        console.log(`Number of days difference: ${daysDifference}`);
        nights.value = daysDifference
        
        diff = daysDifference

    }
    // console.log(price);

    // update Base Priec
    const day = parseInt(document.getElementById('night').value)
    const totalPrice = day * price
    console.log(totalPrice);
    basePrice.value = totalPrice

    // Update Total NET after GST
    updateNet()
}

function changeTotalDays(){
    const totalDays = parseInt(document.getElementById('night').value)
    const price = parseInt(document.getElementById('priceNight').value)
    const basePrice = document.getElementById('baseprice')
    const newbasePrice = totalDays * price
    basePrice.value = newbasePrice
    updateNet()
    
}

function calculateGstPercentage() {
    // Get the elements and their values
    const gstAmount = parseFloat(document.getElementById('gstAmt').value);
    const basePrice = parseFloat(document.getElementById('baseprice').value);

    // Calculate the GST percentage
    const gstPercentage = (gstAmount / basePrice) * 100;

    // Update the GST percentage field with the calculated value
    document.getElementById('gst').value = parseFloat(gstPercentage.toFixed(2)); // Round to 2 decimal places
    updateNet()

}