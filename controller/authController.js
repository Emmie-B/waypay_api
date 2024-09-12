import User from "../models/user.model.js";
import bcrypt from '@node-rs/bcrypt';

const login = async (req, res) => {
    let userLoggedIn = false;

    try {
        const { phone, pin } = req.body;
        const user = await User.findOne({ phone: phone });

        if (user) {
            const isMatch = await bcrypt.compare(pin, user.pin);  // Compare pin using bcrypt
            if (isMatch) {
                userLoggedIn = true;
                res.status(200).json({ message: "Login Successful", userLoggedIn: userLoggedIn, user: user });
            } else {
                res.status(400).json({ message: "Invalid Credentials", success: userLoggedIn });
            }
        } else {
            res.status(400).json({ message: "Invalid Credentials", success: userLoggedIn, user: null});
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export default login;
