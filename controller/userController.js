import { Keypair } from '@solana/web3.js'
import User from '../models/user.model.js';

const createAccount = async (req, res) => {
    try {
      // Validate required fields
      const { name, phone, accountType, pin, profileUrl } = req.body;
      
      if (!name || !phone || !accountType || !pin ) {
        return res.status(400).json({
          message: "All fields are required: name, phone, accountType, pin, profileUrl",
        });
      }
  
      // Check if the account exists via the phone number
      const existingUser = await User.findOne({ phone: phone });
  
      if (existingUser) {
        return res.status(200).json({ data: existingUser, success: false, message: "Account already exists"});
      }
  
      // Generate keypair for the new user
      const keypair = Keypair.generate();
  
      // Create a new user
      const user = new User({
        name: name,
        phone: phone,
        accountType: accountType,
        pin: pin,
        publicKey: keypair.publicKey.toBase58(),
        privateKey: keypair.secretKey.toString(),
        profileUrl: profileUrl || "",  // Optional field with default value
      });
  
      // Save the user to the database
      const savedUser = await user.save();
      res.status(201).json({ data: savedUser, success: true, message: "Account created successfully"});
  
    } catch (err) {
      // Handle errors
      console.error("Error creating account:", err);
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the User.',
        date:null,
        success: false
      });
    }
  };
  


// export user
export { createAccount };

//  export multiple functions