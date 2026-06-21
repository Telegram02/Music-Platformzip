import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import settingsRouter from "./settings";
import tracksRouter from "./tracks";
import portfolioRouter from "./portfolio";
import socialRouter from "./social";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(settingsRouter);
router.use(tracksRouter);
router.use(portfolioRouter);
router.use(socialRouter);
router.use(storageRouter);

export default router;
