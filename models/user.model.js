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
    gender: {
        type: String,
        required: false,
        trim: true,
    },
    accountType: {
        type: String,
        required: true,
        trim: true,
        enum: ['user', 'business', 'driver']  // Example of predefined account types
    },
    profileUrl: {
        type: String,
        required: false,
        trim: true
    },
    address: {
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

// Pre-save middleware to hash the PIN
// userSchema.pre('save', async function(next) {
//     if (this.isModified('pin')) {
//         const salt = await bcrypt.genSalt(10);
//         this.pin = await bcrypt.hash(this.pin, salt);  // Hash the pin before saving
//     }
//     next();
// });

userSchema.pre('save', async function(next) {
    if (this.isModified('pin')) {
        // Directly hash the pin with salt rounds
        this.pin = await bcrypt.hash(this.pin, 10);  // Hash the pin before saving with 10 salt rounds
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
