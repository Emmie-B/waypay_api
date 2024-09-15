// Mock database
let users = {};
let balances = {};

// Main USSD route
const ussd = (req, res) => {
  let { sessionId, serviceCode, phoneNumber, text } = req.body;
  let response = "";
  text = text || '';

  let inputArray = text.split("*");
  let userStep = inputArray.length; // Tracks the user progression in the menu

  // USSD Menu Logic
  if (text === "") {
    // Initial USSD Menu
    response = `CON Welcome to WayPaY!
1. Create Account
2. Check Balance
3. Send Money`;
  } else if (text === "1") {
    // Option 1: Create Account
    response = `CON Enter your name:`;
  } else if (userStep === 2 && inputArray[0] === "1") {
    // Step 2: Enter account type
    response = `CON Choose account type:
1. Individual
2. Business
3. Driver`;
  } else if (userStep === 3 && inputArray[0] === "1") {
    let name = inputArray[1];
    let accountType =
      inputArray[2] === "1"
        ? "Individual"
        : inputArray[2] === "2"
        ? "Business"
        : "Driver";

    users[phoneNumber] = { name, accountType, pin: null };
    balances[phoneNumber] = 10000; // Default balance of 10,000 Leones for new users
    response = `CON Set a 4-digit PIN:`;
  } else if (userStep === 4 && inputArray[0] === "1") {
    // Step 4: Save the PIN and finish registration
    let pin = inputArray[3];
    users[phoneNumber].pin = pin;
    response = `END Account created successfully!`;
  } else if (text === "2") {
    // Option 2: Check Balance
    if (users[phoneNumber]) {
      response = `END Your balance is ${balances[phoneNumber]} Le`;
    } else {
      response = `END You don't have an account. Please create one first.`;
    }
  } else if (text === "3") {
    // Option 3: Send Money - Enter recipient's phone number
    response = `CON Enter recipient's phone number:`;
  } else if (userStep === 2 && inputArray[0] === "3") {
    response = `CON Enter amount to send:`;
  } else if (userStep === 3 && inputArray[0] === "3") {
    response = `CON Enter your PIN:`;
  } else if (userStep === 4 && inputArray[0] === "3") {
    // Send Money Logic
    let recipientPhone = inputArray[1];
    let amount = parseFloat(inputArray[2]);
    let pin = inputArray[3];

    // Check if the user has an account and the correct PIN
    if (users[phoneNumber] && users[phoneNumber].pin === pin) {
      if (balances[phoneNumber] >= amount) {
        // Transfer the money
        balances[phoneNumber] -= amount;
        if (!balances[recipientPhone]) balances[recipientPhone] = 0;
        balances[recipientPhone] += amount;

        response = `END You have successfully sent ${amount} Le to ${recipientPhone}. Your new balance is ${balances[phoneNumber]} Le.`;
      } else {
        response = `END Insufficient balance.`;
      }
    } else {
      response = `END Incorrect PIN or you don't have an account.`;
    }
  } else {
    response = `END Invalid option. Please try again.`;
  }

  // Send the response back
  res.set("Content-Type", "text/plain");
  res.send(response);
};

export default ussd;
