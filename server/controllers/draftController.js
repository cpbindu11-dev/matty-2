import Draft from "../models/Draft.js";

// Save or update draft
export const saveDraft = async (req, res) => {
  try {
    const { title, jsonData, thumbnailUrl, isAutoSave } = req.body;
    
    // Check if there's an existing draft with the same title for this user
    const existingDraft = await Draft.findOne({ 
      userId: req.user, 
      title 
    });

    if (existingDraft) {
      // Update existing draft
      existingDraft.jsonData = jsonData;
      existingDraft.thumbnailUrl = thumbnailUrl;
      existingDraft.isAutoSave = isAutoSave;
      existingDraft.lastModified = new Date();
      await existingDraft.save();
      
      return res.json(existingDraft);
    }

    // Create new draft
    const draft = await Draft.create({ 
      userId: req.user, 
      title, 
      jsonData, 
      thumbnailUrl,
      isAutoSave 
    });
    
    res.status(201).json(draft);
  } catch (error) {
    console.error("Save draft error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all drafts for user
export const getDrafts = async (req, res) => {
  try {
    const drafts = await Draft.find({ userId: req.user })
      .sort({ lastModified: -1 })
      .limit(50); // Limit to 50 most recent drafts
    
    res.json(drafts);
  } catch (error) {
    console.error("Get drafts error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single draft
export const getDraft = async (req, res) => {
  try {
    const draft = await Draft.findOne({
      _id: req.params.id,
      userId: req.user
    });
    
    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }
    
    res.json(draft);
  } catch (error) {
    console.error("Get draft error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete draft
export const deleteDraft = async (req, res) => {
  try {
    const draft = await Draft.findOneAndDelete({
      _id: req.params.id,
      userId: req.user
    });
    
    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }
    
    res.json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Delete draft error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete old auto-saved drafts (cleanup)
export const cleanupOldDrafts = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Draft.deleteMany({
      userId: req.user,
      isAutoSave: true,
      lastModified: { $lt: thirtyDaysAgo }
    });
    
    res.json({ 
      message: "Old drafts cleaned up", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Cleanup drafts error:", error);
    res.status(500).json({ message: error.message });
  }
};
