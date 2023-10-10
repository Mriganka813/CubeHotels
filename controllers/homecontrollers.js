const Guest = require('../models/guest')
const Rooms = require('../models/rooms')
const Invoice = require('../models/invoice')
const roomTypes = ['Delux', 'Standard', 'Royal', 'Office']
const RoomTypes = require('../models/roomType')
const ExcelJS = require('exceljs');
const User = require('../models/user')

module.exports.home = async function (req, res) {
  try{
    const user = req.user;
    return res.render('home', {
            title: "home",
            user: user // Pass the user object to the template
        });
  }catch(err){
    res.send(err)
  }
}

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
    res.send(err)
  }
}



module.exports.renderAddRoom = async (req, res) => {
  try{

    const userId = req.user.userId
    const Category = await RoomTypes.find({ owner: userId })
    // const rooms=await Rooms.find({})
    
    res.render('addrooms', {
      title: "Add",
      Category
    })
  }catch(err){
    res.send(err)
  }
}
module.exports.renderRoomDash = async (req, res) => {
  try{

    const userId = req.user.userId
    const roomCat = await RoomTypes.find({ owner: userId })
    console.log(roomCat);
    res.render('roomdash', {
      title: 'DAshBoard',
      roomCat
    })
  }catch(err){
    res.send(err)
  }
}

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
    res.redirect('/')
  } catch (err) {
    console.log(err);
    res.send(err)
  }
}

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


function generateUniqueBookingId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
    title: 'Bookings',
    bookings
  })
}

module.exports.renderCheckInBookings = async (req, res) => {
  const userId = req.user.userId
  const bookings = await Guest.find({ status: "stay",hotelId:userId })


  res.render('bookings', {
    title: 'Bookings',
    bookings
  })
}

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
    await guest.save()
    console.log(guest);
    
    const invoice = new Invoice({
      guestName: guest.guestName,
      guestId: id,
      roomNum: guest.roomNum,
      roomId: room._id,
      invoiceId: guest.bookingId,
      checkout: cout,
      checlIn: guest.checkIn,
      advance: adv,
      discount: disc,
      serviceCharge: service,
      gst,
      net,
      hotelId,
      stay:stays
    })
    
    await invoice.save()
    const preNet = parseInt(net) + parseInt(adv)
    
    const calGst= preNet * room.gst/100
    const total = preNet + calGst
    
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
      total
    })
  }catch(err){
    res.send(err)
  }
    
}

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

module.exports.reportPage=async(req,res)=>{
  return res.render('reports',{
    title:'Reports'
  })
}

module.exports.getReport = async (req, res) => {
  const userId = req.user.userId;
  const { startDate, endDate } = req.body;

  try {
    // Fetch the invoices from your database based on the userId and date range
    const invoices = await Invoice.find({
      hotelId: userId,

      createdAt: { $gte: startDate, $lte: endDate }, // Assuming you have a createdAt field for timestamps
    });

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');

    // Define the headers for the Excel file based on your schema
    worksheet.columns = [
      { header: 'Guest Name', key: 'guestName' },
      { header: 'Room Number', key: 'roomNum' },
      { header: 'Check-In', key: 'checkIn' },
      { header: 'Check-Out', key: 'checkOut' },
      { header: 'Advance', key: 'advance' },
      { header: 'Discount', key: 'discount' },
      { header: 'Service Charge', key: 'serviceCharge' },
      { header: 'GST', key: 'gst' },
      { header: 'Net Amount', key: 'net' },
      // Add more headers as needed
    ];

    // Add the invoice data to the worksheet
    invoices.forEach((invoice) => {
      worksheet.addRow({
        guestName: invoice.guestName,
        roomNum: invoice.roomNum,
        checkIn: invoice.checkIn,
        checkOut: invoice.checkOut,
        advance: invoice.advance,
        discount: invoice.discount,
        serviceCharge: invoice.serviceCharge,
        gst: invoice.gst,
        net: invoice.net,
        // Add more data columns as needed
      });
    });

    // Set the response headers to specify that you are sending an Excel file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=invoice_report.xlsx'
    );

    // Send the Excel file to the client
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return res.status(500).send('Internal Server Error');
  }
};



module.exports.sample=async(req,res)=>{
  return res.render('sample',{
    title:'INVOICE'
  })
}




module.exports.getReport2 = async (req, res) => {
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
