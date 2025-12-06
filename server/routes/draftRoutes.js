import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  saveDraft, 
  getDrafts, 
  getDraft, 
  deleteDraft,
  cleanupOldDrafts 
} from "../controllers/draftController.js";

const router = express.Router();

router.post("/", protect, saveDraft);
router.get("/", protect, getDrafts);
router.get("/:id", protect, getDraft);
router.delete("/:id", protect, deleteDraft);
router.post("/cleanup", protect, cleanupOldDrafts);

export default router;
