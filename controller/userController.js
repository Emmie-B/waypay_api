import { Keypair } from '@solana/web3.js'
import User from '../models/user.model.js';
import sendMsg from './smsController.js';
import e from 'express';

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
        profileUrl: profileUrl || "",
        accountBalance:"10",
        fareToken:"10",
        points:"10"  // Optional field with default value
      });
  
      // Save the user to the database
      const savedUser = await user.save();
      res.status(201).json({ data: savedUser, success: true, message: "Account created successfully"});
  

      if (accountType === "individual") {
        const message = `Hello ${savedUser.name}, your Personal WayPay account has been successfully created.\nStart sending and receiving oney with ease, pay for goods and services and earn tokens which can be used to get cashback on transaportation fare, discounts of future purchases, access to micro loans and more.
        \nAs a awelcome bonue, you have been credited with NLe10.\n\nWayPay - Creating financial possibilities in emerging markets.`;
        // Send SMS to the recipient
        message = await sendMsg({
          numbers: phone,
          message: message,
        });
        
      }else if (accountType === "business") {
      const messageBiz = `Hello ${savedUser.name}!\n\n Welcome to WayPay Business.\nNow you can accept payments seamlessly, reach more customers, and turn first-time buyers into loyal customers!. Plus, get access to micro loans when you'er a certified WayPay customer\n\nWayPay - Creating financial possibilities in emerging markets.`;
      messageBiz = await sendMsg({
        numbers: recipient.phone,
        message: message,
      });
      }else if (accountType === "driver") {
      const messageDrive = `Hello ${savedUser.name}!\n\n Welcome to WayPay Ride and Drive!.\nYou’re all set to start receiving fares directly to your account!. Plus, get access to micro loans when you'er a certified WayPay customer. \n\nWayPay - Creating financial possibilities in emerging markets.`;
      messageDrive = await sendMsg({
        numbers: recipient.phone,
        message: message,
      });

      }

      // const message = `Hello ${savedUser.name}, your Personal WayPay account has been successfully created.\nStart sending and receiving oney with ease, pay for goods and services and earn tokens which can be used to get cashback on transaportation fare, discounts of future purchases, access to micro loans and more.
      // \nAs a awelcome bonue, you have been credited with NLe10.\n\nWayPay - Creating financial possibilities in emerging markets.`;
      // Send SMS to the recipient
     
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