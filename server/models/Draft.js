import mongoose from "mongoose";

const draftSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true,
    default: "Untitled Draft"
  },
  jsonData: { 
    type: Object, 
    required: true 
  },
  thumbnailUrl: { 
    type: String 
  },
  isAutoSave: {
    type: Boolean,
    default: false
  },
  lastModified: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create index for efficient querying
draftSchema.index({ userId: 1, lastModified: -1 });

export default mongoose.model("Draft", draftSchema);
