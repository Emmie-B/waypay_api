import express from 'express';
import {createAccount} from '../controller/userController.js';
import sendSMS from '../controller/smsController.js';
import transaction from '../controller/transactionController.js';
import createPaymentURL from '../controller/transferRequestController.js';
import login from '../controller/authController.js';
import sendMsg from '../controller/smsController.js';


const router = express.Router();

router.post('/createaccount', createAccount);

// **Express Route to Send SMS**
router.post('/send-sms', sendSMS );

// transfer route
// router.get('/transfer', makeTransfer );
router.post('/transfer', transaction );
router.post('/paymentUrl', createPaymentURL );

router.post('/login', login)


export default router;
