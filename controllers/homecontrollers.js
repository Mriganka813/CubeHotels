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
    console.log('ppp');
    const user = await User.findById(userId)
    const totalRoom = await Rooms.countDocuments({owner:userId,})
    const countAvailRoom = await Rooms.countDocuments({owner:userId,occupied:false})
    const countOccupiedRoom = await Rooms.countDocuments({owner:userId,occupied:true})
    const totalGuest = await Guest.countDocuments({hotelId:userId})
    // console.log(totalRoom,countAvailRoom,countOccupiedRoom);
   
    return res.render('home', {
            title: "home",// Pass the user object to the template
            user,
            totalRoom,
            countAvailRoom,
            countOccupiedRoom,
            totalGuest
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
    // const roomdata =[]
    const roomdata = await Rooms.find({owner:userId})

    // Loop through each room category and count available rooms
    for (const category of roomCat) {
      const availableRoomsCount = await Rooms.countDocuments({
        owner: userId,
        roomTypeId: category._id,
        occupied: false,
      });

      availableRoomCounts.push(availableRoomsCount);
      
    }
    console.log(roomdata);
    res.render('roomdash', {
      title: 'Rooms Dashboard',
      roomCat,
      availableRoomCounts,
      roomdata
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

module.exports.addRoomCat=async(req,res)=>{
  try {
    const userId = req.user.userId;
    const {roomTypeId} = req.params
    const page = req.query.page || 1; // Get the current page from the query string or default to 1.
    const perPage = 15
    ; // Number of rooms per page.
    
    const rooms = await Rooms.find({ owner: userId })
  .sort({ _id: -1 }) // Reverse order by _id (or another suitable field)
  .skip((page - 1) * perPage) // Skip the rooms on previous pages.
  .limit(perPage);
  
    console.log(rooms);
    const totalRooms = await Rooms.countDocuments({ owner: userId });
    const totalPages = Math.ceil(totalRooms / perPage);
    console.log(totalPages);
    const Category = await RoomTypes.findById(roomTypeId);
    
    res.render('addCatRoom', {
      title: "Add",
      rooms,
      Category,
      currentPage: page,
      totalPages,
      roomTypeId
    });
  } catch (err) {
    res.send(err);
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
    const {roomId} = req.params
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
      businessName,
      guestGst,
      roomNum,
      advPaymentMode,
    } = req.body;
    console.log(checkInTime);
    let bookingId;
    let isUnique = false;
    
    // Generate a unique booking ID
  while (!isUnique) {
    bookingId = generateUniqueBookingId();
    isUnique = await isBookingIdUnique(bookingId);
  }

    // Find the room by roomNum
    const room = await Rooms.findById(roomId);

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
  const page = req.query.page || 1; // Get the current page from the query string or default to 1.
  const perPage = process.env.PAGE_COUNT; // Number of rooms per page.
    
  const bookings = await Guest.find()


  res.render('bookings', {
    title: 'ALL Bookings',
    bookings
  })
}

// RECENT BOOKINGS - those who checkout
module.exports.recentBookings=async(req,res)=>{
  const userId=req.user.userId
  const page = req.query.page || 1; // Get the current page from the query string or default to 1.
  const perPage = 15 // Number of rooms per page.
  
  const bookings = await Guest.find({ status: "leave",hotelId:userId })
  .skip((page - 1) * perPage) // Skip the rooms on previous pages.
  .limit(perPage) // Limit the number of rooms on the current page.
  
  const totalBookings = await Guest.countDocuments({ status: "leave", hotelId: userId });
  const totalPages = Math.ceil(totalBookings / perPage);
  // console.log(totalPages);
  res.render('allbookings', {
    title: 'Recent Bookings',
    bookings,
    currentPage: page,
    totalPages
  })

}



module.exports.recentBookingSearch = async (req, res) => {
  try {
    const { search } = req.body; // Use req.query to get the search parameter from the URL query string
    const userId = req.user.userId;
    const page = req.query.page || 1; // Get the current page from the query string or default to 1.
    const perPage = 15; // Number of rooms per page.

    // Create a filter object for the search
    const filter = {
      status: "leave",
      hotelId: userId,
      guestName: { $regex: search, $options: 'i' } // Case-insensitive search on guestName
    };

    const bookings = await Guest.find(filter)
      .skip((page - 1) * perPage) // Skip the rooms on previous pages.
      .limit(perPage); // Limit the number of rooms on the current page.
    // console.log(bookings);
    const totalBookings = await Guest.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / perPage);
    // console.log(totalPages);

    res.render('allbookings', {
      title: 'Recent Bookings',
      bookings,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    // Handle the error and send an error response.
    res.status(500).send('Internal Server Error');
  }
};


// Render Checking Bookings 
module.exports.renderCheckInBookings = async (req, res) => {
  const userId = req.user.userId
  const page = req.query.page || 1; // Get the current page from the query string or default to 1.
  const perPage = 15; // Number of rooms per page.

  const bookings = await Guest.find({ status: "stay",hotelId:userId })
  .skip((page - 1) * perPage) // Skip the rooms on previous pages.
  .limit(perPage);

  const totalBookings = await Guest.countDocuments({ status: "stay", hotelId: userId });
  const totalPages = Math.ceil(totalBookings / perPage);

  res.render('bookings', {
    title: 'Checking Bookings',
    bookings,
    currentPage: page,
    totalPages
  })
}

module.exports.renderCheckInBookingSearch = async (req, res) => {
  const userId = req.user.userId
  const { search } = req.body;
  const page = req.query.page || 1; // Get the current page from the query string or default to 1.
  const perPage = 15; // Number of rooms per page.

  const filter = {
    status: "stay",
    hotelId: userId,
    guestName: { $regex: search, $options: 'i' } // Case-insensitive search on guestName
  };
  const bookings = await Guest.find(filter)
  .skip((page - 1) * perPage) // Skip the rooms on previous pages.
  .limit(perPage);

  const totalBookings = await Guest.countDocuments(filter);
  const totalPages = Math.ceil(totalBookings / perPage);

  res.render('bookings', {
    title: 'Checking Bookings',
    bookings,
    currentPage: page,
    totalPages
  })
}

module.exports.proceedCheckout=async(req,res)=>{
  try{
    const {
      dailyRent,
      basePrice,
      discount,
      serviceCharge,
      gst,
      net,
      night,
      checkOutDate,
      checkOutTime,
      bookingId,
      gstAmt,
      paymentMode,
    }=req.body

    const { guestId } = req.params
    console.log(guestId);
    console.log(net);

    const hotelId = req.user.userId
    console.log(hotelId);

    const guest = await Guest.findById(guestId)
    
    guest.checkOut = checkOutDate
    guest.status = 'leave'
    guest.stay = night
    guest.checkOutTime = checkOutTime
    await guest.save()
    // console.log(guest);
    const room = await Rooms.findById(guest.roomId)
    // console.log(room);
    // Change Checkout Status
 
    
    const hotel = await User.findById(hotelId)
    // console.log(hotel);
    // console.log('check');
    // Update Room Status
    room.occupied = false
    room.guest = null
    await room.save()
    await guest.save()
    
    const invoice = new Invoice({ 
      guestName: guest.guestName,
      guestId: guestId,
      roomNum: guest.roomNum,
      roomId: room._id,
      invoiceId: bookingId,
      discount: discount,
      serviceCharge: serviceCharge,
      checkout: checkOutDate,
      checlIn: guest.checkIn,
      gst:gst,
      net:net,
      rent:basePrice,
      dailyRent:dailyRent,
      stay:night,
      hotelId,
      gstAmt,
      paymentMode,
      checkInTime:guest.checkInTime,
      checkOutTime:checkOutTime,
      advancePayment:guest.advPayment
    })

    
   
    await invoice.save()
    
    guest.invoiceId = invoice._id
    guest.paymentMode = paymentMode
    await guest.save()
    console.log(guest);
    

    return res.render('invoices', {
      title: "Invoice",
      guest,
      invoice,
      hotel,
      room,
    })


  }catch(error){
    res.send(error)
  }
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
    room.guest = null
    await room.save()
    
    
    
    
    console.log(stays);
    const preNet = parseInt(net) + parseInt(adv)
    
    const subTotal = room.price * parseInt(stays)
    
    const calGst= subTotal * room.gst/100
    console.log(subTotal);
    const total = (subTotal + calGst + parseInt(service) )- parseInt(disc) 
    


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
    
    return res.render('invoices', {
      title: "Invoice",
      guest,
      invoice,
      hotel,
      room,
    })
  }catch(err){
    // console.log(err);
    res.send(err)
  }
    
}

// Invoice Page for recent bookings
module.exports.getInvoice=async(req,res)=>{
  try{
    const {guestId} = req.params
    
    const guest= await Guest.findById(guestId)
    const invoice = await Invoice.findById(guest.invoiceId)
    // console.log(guest);
    const userId = invoice.hotelId
    const hotel = await User.findById(userId)
    const room = await Rooms.findById(guest.roomId)

    console.log(invoice);

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
    
    const room = await Rooms.findById(guest.roomId)
    
    
    return res.render('checkoutPage', {
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
    const reports = await Invoice.find({
      hotelId: userId,
      updatedAt: { $gte: startDate, $lte: endDate }, // Assuming you have a createdAt field for timestamps
    });

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
      { header: 'Subtotal', key: 'net' },
      { header: 'Discount', key: 'discount' },
      { header: 'GST Ammount', key: 'gstAmt' },
      { header: 'Service Charge', key: 'serviceCharge' },
      { header: 'Address', key: 'address' },
      { header: 'Payment Mode', key: 'paymentMode' },
    
      // Add more headers as needed
    ];

    // Add the report data to the worksheet
    for (const report of reports) {
      const room = await Rooms.findOne({ roomNum: report.roomNum });
      const guest = await Guest.findOne({_id:report.guestId})
      worksheet.addRow({
        guestName: report.guestName,
        checkInDate: guest.checkIn,
        checkInTime: guest.checkInTime,
        checkOutDate: report.checkout,
        checkOutTime: guest.checkOutTime,
        roomNum: report.roomNum,
        stay: report.stay,
        rent: room.price,
        roomGst: room.gst,
        advance: guest.advance,
        discount: report.discount,
        serviceCharge: report.serviceCharge,
        gst: report.gst,
        gstAmt: report.gstAmt,
        net: report.rent, // change net from invoice
        address:guest.address,
        paymentMode:report.paymentMode
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

module.exports.editbookings=async(req,res)=>{
 const { guestId }=req.params
 const guest = await Guest.findById(guestId)
 console.log(guest);
  return res.render('editbookings',{
    title:'Edit Booking',
    guest
  })
}



module.exports.updatebookings = async (req, res) => {

  const userId = req.user.userId;
  const { guestId } = req.params;
  
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
    businessName,
    guestGst,
    roomNum,
    advPaymentMode,
  } = req.body;

  try {
    const guest = await Guest.findById(guestId);
    const oldRoom = guest.roomNum;
    
    const findRoom = await Rooms.findOne({roomNum,owner:userId})
    if(!findRoom){
      req.flash('error','Room Not Found .....');
      return res.redirect('back')
    }


    // If Room Number is Changed
    if (oldRoom !== roomNum) {
      const room = await Rooms.findOne({ roomNum,owner:userId });
      const oldRoomObj = await Rooms.findOne({ roomNum: oldRoom,owner:userId });

      // If new roomNum is already taken
      if (room.occupied === true) {
        req.flash('error', 'Room is Already Occupied');
        return res.redirect('back');
      }

      room.occupied = true;
      oldRoomObj.occupied = false;

      await oldRoomObj.save();
      await room.save();
    }

    // Update guest details here
    guest.guestName = guestName;
    guest.allGuests = allGuests;
    guest.numberOfGuest = numberOfGuest;
    guest.adults = adults;
    guest.children = children;
    guest.checkIn = checkIn;
    guest.address = address;
    guest.phNumber = phNumber;
    guest.advPayment = advPayment;
    guest.nationality = nationality;
    guest.checkInTime = checkInTime;
    guest.businessName = businessName;
    guest.guestGst = guestGst;
    guest.roomNum = roomNum;
    guest.advPaymentMode = advPaymentMode;

    await guest.save();
    req.flash('success','Details Updated')
    res.redirect('back')

  } catch (error) {
    console.error(error);
    // Handle errors and respond appropriately
    // You can consider sending an error response or redirecting to an error page
  }
};


