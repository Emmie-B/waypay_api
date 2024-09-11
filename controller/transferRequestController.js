import { PublicKey } from '@solana/web3.js';
import { encodeURL } from '@solana/pay';
import BigNumber from 'bignumber.js';

const createPaymentURL = () => {
  // Replace with your merchant's public key
  const recipient = new PublicKey('3BfyNPFa5fEjzoRw7iJWnFGGN9SYZSJfEz3BwdFQLUe1');
  
  // Amount to be paid in SOL
  const amount = new BigNumber(0.3); // 0.3 SOL

  // Optional: A unique reference (can be a transaction or order ID)
  const reference = new PublicKey('4oPiNdZyP5fFrTE5w8jMsyWnYk9QiTTqF9FoehJ2uFbg');

  // Optional: Label for the payment
  const label = "Augustine's Store";

  // Optional: A message for the payment
  const message = "Augustine's Store - your order - #001234";

  // Optional: Memo attached to the transaction
  const memo = 'JC#4098';

  // Encode the payment request into a Solana Pay URL
  const url = encodeURL({
    recipient,
    amount,
    reference, // Optional
    label, // Optional
    message, // Optional
    memo, // Optional
  });

  console.log('Payment URL:', url.href);
  return url;
};

// Call the function to create the payment URL
export default createPaymentURL;
