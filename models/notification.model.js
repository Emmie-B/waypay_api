import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      title: {
        type: String, // Title of the notification
        required: true,
      },
      message: {
        type: String, // Content of the notification
        required: true,
      },
      status: {
        type: String, // Status of the notification
        enum: ['sent', 'read'],
        default: 'sent',
        required: true,
      },
})

// Export the Notification model
const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;