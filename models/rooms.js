const mongoose =require('mongoose');

const roomSchema = mongoose.Schema({
    roomNum:{
        type: String,
        require: true
    },
    roomType:{
        type: String,
        require: true
    },
    roomTypeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomsTypes'
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    price:{
        type: Number,
        // require: true
    },
    capacity:{
        type: Number,
        // require: true
    },
    occupied:{
        type: Boolean,
        default: false
    },
    desc:{
        type:String
    },
    guest:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
    },
    gst:{
        type:Number
    }
   
},
    {
        timestamps: true
    
});

const Rooms=mongoose.model('Rooms',roomSchema);
module.exports=Rooms;