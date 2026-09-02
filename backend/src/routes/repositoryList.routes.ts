import { Router } from "express";
import {
  getRepositoriesController,
} from "../controllers/repositoryList.controller";

const router = Router();

router.get("/", getRepositoriesController);

export default router;