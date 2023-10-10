const mongoose =require('mongoose');

const roomTypeSchema = mongoose.Schema({
    roomType:{
        type:String,
        require: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        require: true
    },
    total:{
        type:Number,
        default:0
    },
    occupied:{
        type:Number
    },
    available:{
        type:Number
    }
   },
    {
        timestamps: true
    
});

const RoomsType=mongoose.model('RoomsTypes',roomTypeSchema);
module.exports=RoomsType;