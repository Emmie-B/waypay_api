import mongoose from "mongoose";
import bcrypt from "@node-rs/bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true  // Ensure phone numbers are unique
    },
    accountBalance: {
        type: String,
        required: false,
        trim: true,
    },
    fareToken: {
        type: String,
        required: false,
        trim: true,
    },
    points: {
        type: String,
        required: false,
        trim: true,
    },
    accountType: {
        type: String,
        required: true,
        trim: true,
        enum: ['individual', 'business', 'driver']  // Example of predefined account types
    },
    profileUrl: {
        type: String,
        required: false,
        trim: true
    },
    
    pin: {
        type: String,
        required: true,
        trim: true
    },
    privateKey: {
        type: String,
        required: true,
        trim: true
    },
    publicKey: {
        type: String,
        trim: true
    },
}, 
{
    timestamps: true
});

// Pre-save middleware to hash the PIN before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('pin')) {
        // Directly hash the pin with salt rounds
        this.pin = await bcrypt.hash(this.pin, 10);  // Hash the pin before saving with 10 salt rounds
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
