import axios from 'axios';

const USERNAME = "support@lifebloodsl.com";
const HASH = process.env.HASH;
const TEST = "0"; // Set to "1" for testing mode

// **Express Route to Send SMS**
const sendSMS = async (req, res) => {
    try {
        // **Extract Data from Request Body**
        const { sender = "WayPay", numbers, message } = req.body;

        // **Validate Required Fields**
        if (!numbers || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: "numbers" and/or "message".'
            });
        }
        // **Prepare Data for the API Request**
        const params = new URLSearchParams();
        params.append('username', USERNAME);
        params.append('hash', HASH);
        params.append('message', message);
        params.append('sender', sender);
        params.append('numbers', numbers);
        params.append('test', TEST);

        // **Send POST Request to txtlocal API**
        const response = await axios.post('https://api.txtlocal.com/send/', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // **Handle API Response**
        if (response.data.status === 'success') {
            res.status(200).json({
                success: true,
                message: 'SMS sent successfully.',
                apiResponse: response.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send SMS.',
                apiResponse: response.data
            });
        }
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            error: error.response ? error.response.data : error.message
        });
    }
};


export default sendSMS;