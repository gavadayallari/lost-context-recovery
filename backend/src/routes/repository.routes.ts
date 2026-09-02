import { Router } from "express";
import { createRepository } from "../controllers/repository.controller";

const router = Router();

router.post("/", createRepository);

export default router;