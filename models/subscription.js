const mongoose =require('mongoose');

const subscriptionSchema = mongoose.Schema({
    
    hotelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        require: true
    },
    hotelName:{
        type:String,
        require: true
    },
    subStartDate:{
        type:Date,
    },
    dueDate:{
        type:Date
    },
    number:{
        type:Number
    },
    paymentMode:{
        type:String
    },
    ammount:{
        type:Number
    }
   },
    {
        timestamps: true
    
});

const Subscription=mongoose.model('SubscriptionSchema',subscriptionSchema);
module.exports=Subscription;