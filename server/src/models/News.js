import mongoose from 'mongoose';

const { Schema } = mongoose;

const NewsSchema = new Schema(
  {
    title: 
    { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: 
    { 
      type: String, 
      required: true 
    },
    photoId: 
    { 
      type: Schema.Types.ObjectId, 
      ref: 'Photo' 
    },
    insertBy: 
    { 
      type: String, 
      required: true 
    },
    updateBy: 
    { 
      type: String 
    }
  },
  { 
    timestamps: 
    { 
      createdAt: 'createdAt', 
      updatedAt: 'updatedAt' 
    } 
  }
);

export default mongoose.model('News', NewsSchema);


