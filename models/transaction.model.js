import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionType: { type: String, enum: ['send', 'receive'], required: true },
    transactionDate: { type: Date, default: Date.now },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed']
    },
    transactionHash: {
        type: String,
        required: false,
    }
},
{
    timestamps: true
});


const TransactionModel = mongoose.model('Transaction', transactionSchema);

export default TransactionModel;