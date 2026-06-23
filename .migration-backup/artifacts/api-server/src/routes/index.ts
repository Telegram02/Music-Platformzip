import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import settingsRouter from "./settings";
import tracksRouter from "./tracks";
import portfolioRouter from "./portfolio";
import socialRouter from "./social";
import storageRouter from "./storage";
import credentialsRouter from "./credentials";
import servicesRouter from "./services";
import contactRouter from "./contact";
import activityRouter from "./activity";
import testimonialsRouter from "./testimonials";
import pricingRouter from "./pricing";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(settingsRouter);
router.use(tracksRouter);
router.use(portfolioRouter);
router.use(socialRouter);
router.use(storageRouter);
router.use(credentialsRouter);
router.use(servicesRouter);
router.use(contactRouter);
router.use(activityRouter);
router.use(testimonialsRouter);
router.use(pricingRouter);
router.use(analyticsRouter);

export default router;
