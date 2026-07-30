import { Router } from "express";
import { jobStore } from "../services/jobStore.service";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime()),
    activeJobs: jobStore.size(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
