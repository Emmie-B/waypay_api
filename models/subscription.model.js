import mongoose from "mongoose";

const customerSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive']
    },
    
},
{
    timestamps: true
});

const CustomerSubscription = mongoose.model('CustomerSubscription', customerSubscriptionSchema);

export default CustomerSubscription;