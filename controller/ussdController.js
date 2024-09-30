// Mock database
let users = {};
let balances = {};
let sessionProgress = {};

// Main USSD route
const ussd = (req, res) => {
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
        ? "Individual"
        : inputArray[2] === "2"
        ? "Business"
        : inputArray[2] === "3"
        ? "Driver"
        : null;
    
    if (!accountType) {
      response = `CON Please select a valid account type.`;
    } else {
      sessionProgress[sessionId].accountType = accountType;
      users[phoneNumber] = {
        name: sessionProgress[sessionId].name,
        accountType,
        pin: null
      };
      balances[phoneNumber] = 10000; // Default balance of 10,000 Leones for new users
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
      response = `END Account created successfully!`;
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
    delete sessionProgress[sessionId]; // Clear session after completion
  } else {
    response = `END Invalid option. Please try again.`;
  }

  // Send the response back
  res.set("Content-Type", "text/plain");
  res.send(response);
};

export default ussd;
