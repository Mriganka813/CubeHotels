const Rooms = require('../models/rooms')

module.exports.adminhome=function(req,res){
    return res.render('adminHome',{
        title: "home"
    })
}


module.exports.rooms=async function(req,res){

    try{
        let rooms= await Rooms.find({}).populate().exec();
        return res.render('addrooms',{
            title: "home",
            rooms:rooms
        })

    }catch (error) {
        console.log('Error rendering home page:', error);
        return res.redirect('back');
      }

    
   
}

module.exports.addrooms=function(req,res){
    
    console.log(req.body.roomtypes);
    Rooms.create({
        roomtype: req.body.roomtypes, 
        qty:req.body.qty,
        price:req.body.price,
        capacity:req.body.cap

    })
    console.log(Rooms);
    return res.redirect('back')
}