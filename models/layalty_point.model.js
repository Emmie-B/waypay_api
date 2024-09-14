import mongoose from "mongoose";

const pointsSchema = new mongoose.Schema({
   
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: String, // Number of points earned or redeemed
    required: true,
  },
  type: {
    type: String, // Type of transaction (earn or redeem)
    enum: ['earn', 'redeem'],
    required: true,
  },
  
},{
    timestamps: true
});

// Export the Points model
const Points = mongoose.model('Points', pointsSchema);

export default Points;