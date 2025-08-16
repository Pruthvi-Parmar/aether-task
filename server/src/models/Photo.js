import mongoose from 'mongoose';

const { Schema } = mongoose;

const PhotoSchema = new Schema(
  {
    filename: 
    { 
      type: String, 
      required: true 
    },
    originalname: 
    { 
      type: String 
    },
    mimetype: 
    { 
      type: String 
    },
    size: 
    { 
      type: Number 
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('Photo', PhotoSchema);


