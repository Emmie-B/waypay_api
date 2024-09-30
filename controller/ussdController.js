import sendMsg from './smsController.js';

let users = {};
let balances = {};
let sessionProgress = {};

// Helper function to format user's phone number
const formatUserPhone = (phoneNumber) => {
  if (phoneNumber.startsWith("+232")) {
    return phoneNumber.replace("+", "");  // Remove "+" for user's phone
  }
  return phoneNumber;
};

// Helper function to format recipient's phone number
const formatRecipientPhone = (phoneNumber) => {
  if (phoneNumber.startsWith("0")) {
    return "232" + phoneNumber.slice(1);  // Replace leading "0" with "+232"
  }
  return phoneNumber;
};

 

// Main USSD Route
const ussd = async (req, res) => {
  let { sessionId, serviceCode, phoneNumber, text } = req.body;
  let response = "";
  text = text || "";
  let inputArray = text.split("*");

  // Initialize user session progress if it doesn't exist
  if (!sessionProgress[sessionId]) {
    sessionProgress[sessionId] = { step: 0 };
  }

  // Tracks the user progression in the menu
  let userStep = sessionProgress[sessionId].step;

  // USSD Menu Logic
  if (text === "") {
    // Initial USSD Menu
    response = `CON Welcome to WayPaY!
1. Create Account
2. Check Balance
3. Send Money`;
    sessionProgress[sessionId].step = 1;
  } else if (text === "1" && userStep === 1) {
    // Option 1: Create Account
    response = `CON Enter your name:`;
    sessionProgress[sessionId].step = 2;
  } else if (inputArray[0] === "1" && userStep === 2) {
    // Step 2: Enter account type
    let name = inputArray[1];
    if (!name) {
      response = `CON Please enter a valid name.`;
    } else {
      sessionProgress[sessionId].name = name;
      response = `CON Choose account type:
1. Individual
2. Business
3. Driver`;
      sessionProgress[sessionId].step = 3;
    }
  } else if (inputArray[0] === "1" && userStep === 3) {
    // Step 3: Set account type and PIN
    let accountType =
      inputArray[2] === "1"
        ? "individual"
        : inputArray[2] === "2"
        ? "business"
        : inputArray[2] === "3"
        ? "driver"
        : null;

    if (!accountType) {
      response = `CON Please select a valid account type.`;
    } else {
      sessionProgress[sessionId].accountType = accountType;
      users[phoneNumber] = {
        name: sessionProgress[sessionId].name,
        accountType,
        pin: null,
      };
      balances[phoneNumber] = 100; // Default balance of 10,000 Leones for new users
      response = `CON Set a 4-digit PIN:`;
      sessionProgress[sessionId].step = 4;
    }
  } else if (inputArray[0] === "1" && userStep === 4) {
    // Step 4: Save the PIN and finish registration
    let pin = inputArray[3];
    if (!pin || pin.length !== 4 || isNaN(pin)) {
      response = `CON Please enter a valid 4-digit PIN.`;
    } else {
      users[phoneNumber].pin = pin;
      
      // Format phone number and send account creation message
      let savedUser = users[phoneNumber];
      
      
      response = `END Account created successfully!`;
      phoneNumber = formatUserPhone(phoneNumber);
      await sendAccountCreationMessage(savedUser, savedUser.accountType, phoneNumber);
      delete sessionProgress[sessionId]; // Clear session after completion
    }
  } else if (text === "2" && userStep === 1) {
    // Option 2: Check Balance
    if (users[phoneNumber]) {
      response = `END Your balance is ${balances[phoneNumber]} Le`;
    } else {
      response = `END You don't have an account. Please create one first.`;
    }
  } else if (text === "3" && userStep === 1) {
    // Option 3: Send Money - Enter recipient's phone number
    response = `CON Enter recipient's phone number:`;
    sessionProgress[sessionId].step = 2;
  } else if (inputArray[0] === "3" && userStep === 2) {
    // Step 2: Enter amount to send
    let recipientPhone = inputArray[1];
    if (!recipientPhone || isNaN(recipientPhone)) {
      response = `CON Please enter a valid recipient phone number.`;
    } else {
      sessionProgress[sessionId].recipientPhone = recipientPhone;
      response = `CON Enter amount to send:`;
      sessionProgress[sessionId].step = 3;
    }
  } else if (inputArray[0] === "3" && userStep === 3) {
    // Step 3: Enter PIN
    let amount = parseFloat(inputArray[2]);
    if (isNaN(amount) || amount <= 0) {
      response = `CON Please enter a valid amount.`;
    } else {
      sessionProgress[sessionId].amount = amount;
      response = `CON Enter your PIN:`;
      sessionProgress[sessionId].step = 4;
    }
  } else if (inputArray[0] === "3" && userStep === 4) {
    // Step 4: Send Money Logic
    let pin = inputArray[3];
    let recipientPhone = sessionProgress[sessionId].recipientPhone;
    let amount = sessionProgress[sessionId].amount;

    // Check if the user has an account and the correct PIN
    if (users[phoneNumber] && users[phoneNumber].pin === pin) {
      if (balances[phoneNumber] >= amount) {
        // Format phone numbers
        recipientPhone = formatRecipientPhone(recipientPhone);
        phoneNumber = formatUserPhone(phoneNumber);

        // Transfer the money
        balances[phoneNumber] -= amount;
        if (!balances[recipientPhone]) balances[recipientPhone] = 0;
        balances[recipientPhone] += amount;

        // Send messages to both sender and recipient
        let sender = users[phoneNumber];
        let recipient = users[recipientPhone] || { name: recipientPhone };  // Fallback in case the recipient isn't registered

        await sendMoney(phoneNumber, recipientPhone, amount);
        
        response = `END You have successfully sent ${amount} Le to ${recipientPhone}. Your new balance is ${balances[phoneNumber]} Le.`;
      } else {
        response = `END Insufficient balance.`;
      }
    } else {
      response = `END Incorrect PIN or you don't have an account.`;
    }
    delete sessionProgress[sessionId]; // Clear session after completion
  } else {
    response = `END Invalid option. Please try again.`;
  }

  // Send the response back
  res.set("Content-Type", "text/plain");
  res.send(response);
};

// Function to handle account creation messages
 

// Export the USSD handler
export default ussd;






























// // Mock database
// let users = {};
// let balances = {};
// let sessionProgress = {};

// // Main USSD route
// const ussd = (req, res) => {
//   let { sessionId, serviceCode, phoneNumber, text } = req.body;
//   let response = "";
//   text = text || "";
//   let inputArray = text.split("*");

//   // Initialize user session progress if it doesn't exist
//   if (!sessionProgress[sessionId]) {
//     sessionProgress[sessionId] = { step: 0 };
//   }

//   // Tracks the user progression in the menu
//   let userStep = sessionProgress[sessionId].step;

//   // USSD Menu Logic
//   if (text === "") {
//     // Initial USSD Menu
//     response = `CON Welcome to WayPaY!
// 1. Create Account
// 2. Check Balance
// 3. Send Money`;
//     sessionProgress[sessionId].step = 1;
//   } else if (text === "1" && userStep === 1) {
//     // Option 1: Create Account
//     response = `CON Enter your name:`;
//     sessionProgress[sessionId].step = 2;
//   } else if (inputArray[0] === "1" && userStep === 2) {
//     // Step 2: Enter account type
//     let name = inputArray[1];
//     if (!name) {
//       response = `CON Please enter a valid name.`;
//     } else {
//       sessionProgress[sessionId].name = name;
//       response = `CON Choose account type:
// 1. Individual
// 2. Business
// 3. Driver`;
//       sessionProgress[sessionId].step = 3;
//     }
//   } else if (inputArray[0] === "1" && userStep === 3) {
//     // Step 3: Set account type and PIN
//     let accountType =
//       inputArray[2] === "1"
//         ? "Individual"
//         : inputArray[2] === "2"
//         ? "Business"
//         : inputArray[2] === "3"
//         ? "Driver"
//         : null;
    
//     if (!accountType) {
//       response = `CON Please select a valid account type.`;
//     } else {
//       sessionProgress[sessionId].accountType = accountType;
//       users[phoneNumber] = {
//         name: sessionProgress[sessionId].name,
//         accountType,
//         pin: null
//       };
//       balances[phoneNumber] = 100; // Default balance of 10,000 Leones for new users
//       response = `CON Set a 4-digit PIN:`;
//       sessionProgress[sessionId].step = 4;
//     }
//   } else if (inputArray[0] === "1" && userStep === 4) {
//     // Step 4: Save the PIN and finish registration
//     let pin = inputArray[3];
//     if (!pin || pin.length !== 4 || isNaN(pin)) {
//       response = `CON Please enter a valid 4-digit PIN.`;
//     } else {
//       users[phoneNumber].pin = pin;
//       response = `END Account created successfully!`;
//       delete sessionProgress[sessionId]; // Clear session after completion
//     }
//   } else if (text === "2" && userStep === 1) {
//     // Option 2: Check Balance
//     if (users[phoneNumber]) {
//       response = `END Your balance is ${balances[phoneNumber]} Le`;
//     } else {
//       response = `END You don't have an account. Please create one first.`;
//     }
//   } else if (text === "3" && userStep === 1) {
//     // Option 3: Send Money - Enter recipient's phone number
//     response = `CON Enter recipient's phone number:`;
//     sessionProgress[sessionId].step = 2;
//   } else if (inputArray[0] === "3" && userStep === 2) {
//     // Step 2: Enter amount to send
//     let recipientPhone = inputArray[1];
//     if (!recipientPhone || isNaN(recipientPhone)) {
//       response = `CON Please enter a valid recipient phone number.`;
//     } else {
//       sessionProgress[sessionId].recipientPhone = recipientPhone;
//       response = `CON Enter amount to send:`;
//       sessionProgress[sessionId].step = 3;
//     }
//   } else if (inputArray[0] === "3" && userStep === 3) {
//     // Step 3: Enter PIN
//     let amount = parseFloat(inputArray[2]);
//     if (isNaN(amount) || amount <= 0) {
//       response = `CON Please enter a valid amount.`;
//     } else {
//       sessionProgress[sessionId].amount = amount;
//       response = `CON Enter your PIN:`;
//       sessionProgress[sessionId].step = 4;
//     }
//   } else if (inputArray[0] === "3" && userStep === 4) {
//     // Step 4: Send Money Logic
//     let pin = inputArray[3];
//     let recipientPhone = sessionProgress[sessionId].recipientPhone;
//     let amount = sessionProgress[sessionId].amount;

//     // Check if the user has an account and the correct PIN
//     if (users[phoneNumber] && users[phoneNumber].pin === pin) {
//       if (balances[phoneNumber] >= amount) {
//         // Transfer the money
//         balances[phoneNumber] -= amount;
//         if (!balances[recipientPhone]) balances[recipientPhone] = 0;
//         balances[recipientPhone] += amount;

//         response = `END You have successfully sent ${amount} Le to ${recipientPhone}. Your new balance is ${balances[phoneNumber]} Le.`;
//       } else {
//         response = `END Insufficient balance.`;
//       }
//     } else {
//       response = `END Incorrect PIN or you don't have an account.`;
//     }
//     delete sessionProgress[sessionId]; // Clear session after completion
//   } else {
//     response = `END Invalid option. Please try again.`;
//   }

//   // Send the response back
//   res.set("Content-Type", "text/plain");
//   res.send(response);
// };

// export default ussd;



// Helper functions for formatting phone numbers
 

// Main function to handle account creation messages
const sendAccountCreationMessage = async (savedUser, accountType, phone) => {
  phone = formatUserPhone(phone); // Format user's phone number

  let message;
  if (accountType === "individual") {
    message = `Hello ${savedUser.name}, your Personal WayPay account has been successfully created.\nStart sending and receiving money with ease, pay for goods and services, and earn tokens which can be used to get cashback on transportation fare, discounts on future purchases, access to micro loans, and more.\nAs a welcome bonus, you have been credited with NLe10.\n\nWayPay - Creating financial possibilities in emerging markets.`;
  } else if (accountType === "business") {
    message = `Hello ${savedUser.name}!\n\nWelcome to WayPay Business.\nNow you can accept payments seamlessly, reach more customers, and turn first-time buyers into loyal customers! Plus, get access to micro loans when you're a certified WayPay customer.\n\nWayPay - Creating financial possibilities in emerging markets.`;
  } else if (accountType === "driver") {
    message = `Hello ${savedUser.name}!\n\nWelcome to WayPay Ride and Drive!\nYou’re all set to start receiving fares directly to your account! Plus, get access to micro loans when you're a certified WayPay customer.\n\nWayPay - Creating financial possibilities in emerging markets.`;
  }

  await sendMsg({
    numbers: phone,
    message: message,
  });
};

// Function to handle sending money
const sendMoney = async (senderPhone, recipientPhone, amount) => {
  senderPhone = formatUserPhone(senderPhone);  // Format sender's phone
  recipientPhone = formatRecipientPhone(recipientPhone);  // Format recipient's phone

  // Proceed with sending the money logic, e.g.,:
  const message = `You have successfully sent ${amount} to ${recipientPhone}`;
  await sendMsg({
    numbers: senderPhone,
    message: message,
  });
};
