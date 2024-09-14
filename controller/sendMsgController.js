import axios from 'axios';

const USERNAME = "support@lifebloodsl.com";
const HASH = process.env.HASH;
const TEST = "0"; // Set to "1" for testing mode

// **Function to Send SMS with Parameters**
const sendMsg = async ({ sender = "WayPay", numbers, message }) => {
    try {
        // **Validate Required Fields**
        if (!numbers || !message) {
            return {
                success: false,
                error: 'Missing required fields: "numbers" and/or "message".'
            };
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
console.log(response.data)
        // **Handle API Response**
        if (response.data.status === 'success') {
            return {
                success: true,
                message: 'SMS sent successfully.',
                apiResponse: response.data
            };
        } else {
            return {
                success: false,
                message: 'Failed to send SMS.',
                apiResponse: response.data
            };
        }
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        return {
            success: false,
            error: error.response ? error.response.data : error.message
        };
    }
};

export default sendMsg;
