const Guest = require('../models/guest')
const Rooms = require('../models/rooms')
const Invoice = require('../models/invoice')
const roomTypes = ['Delux', 'Standard', 'Royal', 'Office']
const RoomTypes = require('../models/roomType')
const ExcelJS = require('exceljs');
const User = require('../models/user')

// Render Dashboard if Login
module.exports.home = async function (req, res) {
  try{
    const userId=req.user.userId
    const user = await User.findById(userId)
    return res.render('home', {
            title: "home",// Pass the user object to the template
            user
          });
  }catch(err){
    res.send(err)
  }
}

// RENDER ADD GUEST Page
module.exports.addGuest =async function (req, res) {
  try{

    const user=req.user.id
    const { roomId } = req.params
    console.log(roomId);
    const room= await Rooms.findById(roomId)
    console.log(room);
    
    res.render('addguest', {
      title: "Add",
      room
    })
  }catch(err){
    console.log(err);
    return res.redirect('/error')
  }
}

// REnder Add Room Page
module.exports.renderAddRoom = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = req.query.page || 1; // Get the current page from the query string or default to 1.
    const perPage = process.env.PAGE_COUNT; // Number of rooms per page.
    
    const rooms = await Rooms.find({ owner: userId })
      .skip((page - 1) * perPage) // Skip the rooms on previous pages.
      .limit(perPage) // Limit the number of rooms on the current page.
      
    const totalRooms = await Rooms.countDocuments({ owner: userId });
    const totalPages = Math.ceil(totalRooms / perPage);
    
    const Category = await RoomTypes.find({ owner: userId });
    
    res.render('addrooms', {
      title: "Add",
      rooms,
      Category,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    res.send(err);
  }
}

// Render RoomDashboard - BookNow select room type
module.exports.renderRoomDash = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch room categories from the first collection (RoomTypes)
    const roomCat = await RoomTypes.find({ owner: userId });

    // Create an array to store available room counts for each category
    const availableRoomCounts = [];

    // Loop through each room category and count available rooms
    for (const category of roomCat) {
      const availableRoomsCount = await Rooms.countDocuments({
        owner: userId,
        roomTypeId: category._id,
        occupied: false,
      });

      availableRoomCounts.push(availableRoomsCount);
    }

    res.render('roomdash', {
      title: 'Rooms Dashboard',
      roomCat,
      availableRoomCounts,
    });
  } catch (err) {
    res.send(err);
  }
};

// ADD Room Data To DB
module.exports.addRoom = async (req, res) => {
  try {
    const userId = req.user.userId
    const {
      roomNum,
      roomType,
      price,
      capacity,
      gst,
    } = req.body


    const cat = await RoomTypes.findOne({ roomType: roomType,owner:userId })
    console.log(cat);

    const findRoom = await Rooms.findOne({roomNum:roomNum, owner:userId})
    if(findRoom){
      req.flash('error','Room Already Present');
      return res.redirect('back')
    }

    const newRoom = new Rooms({
      ...req.body,
      roomTypeId: cat._id,
      owner: userId

    })
    await newRoom.save()
    console.log(roomType);
    const updateRoom = await RoomTypes.findOne({ owner:userId, roomType: roomType });
    updateRoom.total++
    await updateRoom.save()
    req.flash('success','Added');
    res.redirect('back')
  } catch (err) {
    console.log(err);
    res.send(err)
  }
}

// Delete Room
module.exports.deleteRoom= async(req,res)=>{
  try{
    const {roomId}=req.params

  const delRoom = await Rooms.deleteOne({_id:roomId})
 
  req.flash('error','Deleted');
  return res.redirect('back')
  }catch(err){
    res.send(err)
  }
}

// Render Select Room page - Select Room For GUEST
module.exports.select = async (req, res) => {
  try{

    const { roomName } = req.params
    
    const type = await RoomTypes.findOne({_id:roomName})
    console.log(type);
    const room = await Rooms.find({ roomTypeId: roomName })
    console.log(room);
    return res.render('selectRoom', {
      title: 'Room',
      room,
      type
    })
  }catch(err){
    res.send(err)
  }
}

// Function To genrate RoomID
function generateUniqueBookingId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let bookingId = '';

  // Generate a random ID
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    bookingId += characters.charAt(randomIndex);
  }

  return bookingId;
}

// Function to check if a booking ID is unique
async function isBookingIdUnique(bookingId) {
  try {
    // Check if a guest with the same booking ID already exists
    const existingGuest = await Guest.findOne({ bookingId });

    // If there's an existing guest with the same booking ID, it's not unique
    return !existingGuest;
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error('Error checking booking ID uniqueness:', error);
    return false; // You can handle this error as needed
  }
}

// PUSH GUEST DATA IN DB
module.exports.addGuestData = async (req, res) => {
  
  try {
    const hotelId = req.user.userId
    // const {roomNum} = req.params
    const {
      guestName,
      allGuests,
      numberOfGuest,
      adults,
      children,
      checkIn,
      address,
      phNumber,
      advPayment,
      nationality,
      checkInTime,
      roomNum,
    } = req.body;
    
    let bookingId;
    let isUnique = false;
    
    // Generate a unique booking ID
  while (!isUnique) {
    bookingId = generateUniqueBookingId();
    isUnique = await isBookingIdUnique(bookingId);
  }

    // Find the room by roomNum
    const room = await Rooms.findOne({ roomNum });

    if (!room) {
      // Handle the case where the room with the provided roomNum doesn't exist
      return res.status(404).json({ error: 'Room not found' });
    }

    room.occupied = true;
    await room.save();

    const newGuest = new Guest({
      ...req.body,
      bookingId,
      hotelId,
      roomId:room.id
    });
    await newGuest.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.renderBookings = async (req, res) => {
  const userId = req.user.userId
  const bookings = await Guest.find()


  res.render('bookings', {
    title: 'ALL Bookings',
    bookings
  })
}

// RECENT BOOKINGS - those who checkout
module.exports.recentBookings=async(req,res)=>{
  const userId=req.user.userId
  const bookings = await Guest.find({ status: "leave",hotelId:userId })
  res.render('allbookings', {
    title: 'Recent Bookings',
    bookings
  })

}

// Render Checking Bookings 
module.exports.renderCheckInBookings = async (req, res) => {
  const userId = req.user.userId
  const bookings = await Guest.find({ status: "stay",hotelId:userId })

  res.render('bookings', {
    title: 'Checking Bookings',
    bookings
  })
}

// Checkout Logic and  Render Invoice
module.exports.checkout = async (req, res) => {
  try{

    const { id } = req.params
    const hotelId = req.user.userId
    const {
      bid,
      rent,
      adv,
      disc,
      service,
      gst,
      net,
      stays,
      cout,
      checkOutTime
    } = req.body
    
    const guest = await Guest.findById(id)

    guest.checkOut = cout
    guest.status = 'leave'
    guest.checkOutTime = checkOutTime
    const room = await Rooms.findById(guest.roomId)
    const hotel = await User.findById(hotelId)
    
    room.occupied = false
    await room.save()
    room.guest = null
  
    // console.log(guest);
    
    
    
    const preNet = parseInt(net) + parseInt(adv)
    
    const subTotal = room.rentg * stays
    const calGst= subTotal * room.gst/100
    const total = subTotal + calGst - disc
    
    const invoice = new Invoice({
      guestName: guest.guestName,
      guestId: id,
      roomNum: guest.roomNum,
      roomId: room._id,
      invoiceId: guest.bookingId,
      checkout: cout,
      checlIn: guest.checkIn,
      discount: disc,
      serviceCharge: service,
      gst:calGst,
      rent:subTotal,
      net:total,
      hotelId,
      stay:stays,
      subTotal
    })
    await invoice.save()

    guest.invoiceId = invoice._id
    await guest.save()
    // console.log(invoice);
    
    return res.render('sample', {
      title: "Invoice",
      invoice,
      rent,
      preNet,
      guest,
      hotel,
      room,
      calGst,
      total,
      invoice
    })
  }catch(err){
    console.log(err);
    res.send(err)
  }
    
}

// Invoice Page for recent bookings
module.exports.getInvoice=async(req,res)=>{
  try{
    const {guestId} = req.params
    const guest= await Guest.findById(guestId)
    const invoice = await Invoice.findById(guest.invoiceId)
    const userId = invoice.hotelId
    const hotel = await User.findById(userId)
    const room = await Rooms.findById(guest.roomId)

    return res.render('invoices',{
      title:'INVOICE',
      guest,
      invoice,
      hotel,
      room
    })

    
  }catch(error){
    console.log(error);
  }
}

// RENDER CHECKOUT PAGE
module.exports.checkoutPage = async (req, res) => {
  try{

    const { id } = req.params
    const guest = await Guest.findById(id)
    console.log(guest);
    const room = await Rooms.findById(guest.roomId)
    console.log(room);
    
    return res.render('checkout', {
      title: 'CheckOut',
      guest,
      room
    })
  }catch(err){
    res.send(err)
  }
    
}

// REnder Report Pages
module.exports.reportPage=async(req,res)=>{
  return res.render('reports',{
    title:'Reports'
  })
}

// Send reports in excel files 
// module.exports.getReport = async (req, res) => {
//   const userId = req.user.userId;
//   const { startDate, endDate } = req.body;

//   try {
//     // Fetch the invoices from your database based on the userId and date range
//     const invoices = await Invoice.find({
//       hotelId: userId,

//       createdAt: { $gte: startDate, $lte: endDate }, // Assuming you have a createdAt field for timestamps
//     });

//     // Create a new Excel workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Invoices');

//     // Define the headers for the Excel file based on your schema
//     worksheet.columns = [
//       { header: 'Guest Name', key: 'guestName' },
//       { header: 'Room Number', key: 'roomNum' },
//       { header: 'Check-In', key: 'checkIn' },
//       { header: 'Check-Out', key: 'checkOut' },
//       { header: 'Advance', key: 'advance' },
//       { header: 'Discount', key: 'discount' },
//       { header: 'Service Charge', key: 'serviceCharge' },
//       { header: 'GST', key: 'gst' },
//       { header: 'Net Amount', key: 'net' },
//       // Add more headers as needed
//     ];

//     // Add the invoice data to the worksheet
//     invoices.forEach((invoice) => {
//       worksheet.addRow({
//         guestName: invoice.guestName,
//         roomNum: invoice.roomNum,
//         checkIn: invoice.checkIn,
//         checkOut: invoice.checkOut,
//         advance: invoice.advance,
//         discount: invoice.discount,
//         serviceCharge: invoice.serviceCharge,
//         gst: invoice.gst,
//         net: invoice.net,
//         // Add more data columns as needed
//       });
//     });

//     // Set the response headers to specify that you are sending an Excel file
//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader(
//       'Content-Disposition',
//       'attachment; filename=invoice_report.xlsx'
//     );

//     // Send the Excel file to the client
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error('Error generating Excel report:', error);
//     return res.status(500).send('Internal Server Error');
//   }
// };



module.exports.sample=async(req,res)=>{
  return res.render('sample',{
    title:'INVOICE'
  })
}



// Send reports in excel files 
module.exports.getReport = async (req, res) => {
  const userId = req.user.userId;
  console.log(userId);
  const { startDate, endDate } = req.body;

  try {
    // Fetch the reports from your database based on the userId, stay, and date range
    const reports = await Guest.find({
      hotelId: userId,
      status: "leave",
      createdAt: { $gte: startDate, $lte: endDate }, // Assuming you have a createdAt field for timestamps
    });

    console.log(reports);
    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');

    // Define the headers for the Excel file based on your schema
    worksheet.columns = [
      { header: 'Guest Name', key: 'guestName' },
      { header: 'Check-In Date', key: 'checkInDate' },
      { header: 'Check-In Time', key: 'checkInTime' },
      { header: 'Check-Out Date', key: 'checkOutDate' },
      { header: 'Check-Out Time', key: 'checkOutTime' },
      { header: 'Room Number', key: 'roomNum' },
      { header: 'Rent', key: 'rent' },
      { header: 'Days', key: 'stay' },
      { header: 'GST Percent', key: 'roomGst' },
      { header: 'Discount', key: 'discount' },
      { header: 'Service Charge', key: 'serviceCharge' },
      { header: 'Net Amount', key: 'net' },
      { header: 'Address', key: 'address' },
      // Add more headers as needed
    ];

    // Add the report data to the worksheet
    for (const report of reports) {
      const room = await Rooms.findOne({ roomNum: report.roomNum });
      worksheet.addRow({
        guestName: report.guestName,
        checkInDate: report.checkIn,
        checkInTime: report.checkInTime,
        checkOutDate: report.checkOut,
        checkOutTime: report.checkOutTime,
        roomNum: report.roomNum,
        stay: report.stay,
        rent: room.price,
        roomGst: room.gst,
        advance: report.advance,
        discount: report.discount,
        serviceCharge: report.serviceCharge,
        gst: report.gst,
        net: report.net,
        address:report.address
        // Add more data columns as needed
      });
    }

    // Set the response headers to specify that you are sending an Excel file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=report.xlsx'
    );

    // Send the Excel file to the client
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return res.status(500).send('Internal Server Error');
  }
};



// 
// const puppeteer = require('puppeteer');
// var fs         = require('fs');




// module.exports.print = async (req, res) => {
//   try {
//     const { invoiceId } = req.params;
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Load the HTML content from the URL
//     await page.goto(`http://localhost:8007/get/invoices/${invoiceId}`);
   

    
//     // Define the selector to capture
//     const selector = '#invoice';
//     await page.waitForSelector('#invoice');
//     const elementHandle = await page.$(selector);

//     // Load your CSS file
//     const css = fs.readFileSync('./assets/css/bill.css', 'utf8');

//     // Get the HTML content of the element
//     const html = await page.evaluate(element => element.outerHTML, elementHandle);

//     const { width, height } = await page.evaluate(element => {
//       const rect = element.getBoundingClientRect();
//       return { width: rect.width, height: rect.height };
//     }, elementHandle);
//     // Create a new page and set the CSS and HTML content
//     const newPage = await browser.newPage();
//     await newPage.setContent(`<style>${css}</style>${html}`);

    
//     // Generate the PDF
//     const pdf = await newPage.pdf({
//       // format: 'A4',
//       preferCSSPageSize: true,
//       printBackground: true,
//       fullPage: true,
//       width: '176mm',
//       padding:{
//           top: '0mm',
//         bottom: '0mm',
//         left: '0mm',
//         right: '0mm'
//       },
//       margin: {
//         top: '0mm',
//         bottom: '0mm',
//         left: '0mm',
//         right: '0mm'
//       }
//   });

//     await browser.close();

//     res.set('Content-Type', 'application/pdf');
//     res.send(pdf);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// };
