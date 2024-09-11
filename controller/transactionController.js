import {
  Keypair,
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import 'dotenv/config';
import User from '../models/user.model.js';

const makeTransfer = async (req, res) => {
  try {
    const { receiverPhone, receiverPublicKey, amount, pin  } = req.body;

    // Fetch sender information
    const sender = await User.findById("66d71eded21d153688afb7ac");
    // const sender = await User.findOne({phone: "23276715012"})
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Parse the string representation into an array of integers
    const privateKeyArray = sender.privateKey.split(',').map((num) => parseInt(num.trim()));

    // Create the Uint8Array from the array of integers
    const privateKeyUint8Array = Uint8Array.from(privateKeyArray);

    // Create the sender's Keypair
    const senderKeypair = Keypair.fromSecretKey(privateKeyUint8Array);

    const fromPubkey = senderKeypair.publicKey;
    // Fetch receiver information
       const receiver = await User.findOne({ phone: "23275730450" });
      if (!receiver) {
       return res.status(404).json({ message: 'Receiver not found' });
      }
      console.log(receiver)

     const toPubKey = new PublicKey(receiver.publicKey);
    


    // Validate public keys
    if (!PublicKey.isOnCurve(toPubKey) || !PublicKey.isOnCurve(fromPubkey)) {
      return res.status(400).json({ message: 'Invalid public key(s)' });
    }

    // Initialize Solana connection
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    console.log(pin)
    // Check if the transaction key is valid
    if (pin !== sender.pin ) {
      return res.status(400).json({ message: 'Invalid transaction key' });
    }

    // Build and send transaction
    const lamportsToSend = LAMPORTS_PER_SOL * amount; // Adjust based on the conversion rate if needed
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: toPubKey,
        lamports: lamportsToSend,
      })
    );

    try {
      const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
      if (signature) {


        return res.status(200).json({
          message: `Transaction successful! Signature: ${signature}, Amount: ${amount} SOL, Receiver: ${toPubkey.toBase58()}`,
        });
      }
    } catch (error) {
      console.error('Failed to send transaction:', error.message);
      return res.status(500).json({ message: 'Failed to send transaction', error: error.message });
    }





  } catch (error) {
    console.error('Transaction failed:', error.message);
    return res.status(500).json({ message: 'Transaction failed', error: error.message });
  }
};



const getBalance = async (req, res) => {
  try {
    const { publicKey } = req.body;

    // Initialize Solana connection
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Fetch balance
    const balance = await connection.getBalance(new PublicKey(publicKey));

    return res.status(200).json({ balance: balance / LAMPORTS_PER_SOL });
  } catch (error) {
    console.error('Failed to fetch balance:', error.message);
    return res.status(500).json({ message: 'Failed to fetch balance', error: error.message });
  }
}

// const transaction = asycn(req,res) => {
//   //  check if this is the first transaction the user is doing to a particulart business
//   // if it is, fire up the subscribe function: this function subscribe  a user to a business
//   // make sure this is only don for users that are paying to businesses
// }



const transaction = async (req, res) => {
  try {
    const { userId, businessId, amount, transactionType } = req.body;

    // Only check subscription if the transaction is related to a business
    if (transactionType === 'business') {
      // Check if this is the user's first transaction with the business
      const existingTransaction = await Transaction.findOne({
        userId: userId,
        businessId: businessId
      });

      if (!existingTransaction) {
        // If no existing transaction is found, subscribe the user to the business
        await subscribe(userId, businessId);
        console.log('User subscribed to the business.');
      }
    }

    // Continue with the transaction logic
    const newTransaction = new Transaction({
      userId,
      businessId,
      amount,
      transactionType,
      status: 'completed'
    });

    await newTransaction.save();

    res.status(200).json({
      message: 'Transaction completed successfully',
      transaction: newTransaction
    });

  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to subscribe a user to a business
const subscribe = async (userId, businessId) => {
  try {
    const newSubscription = new Subscription({
      userId,
      businessId,
      subscribedAt: new Date()
    });

    await newSubscription.save();
    console.log('Subscription saved successfully');
  } catch (error) {
    console.error('Error subscribing user to business:', error);
    throw error;  // Optionally, handle this error in the transaction logic
  }
};

export default transaction;



// export default makeTransfer;
