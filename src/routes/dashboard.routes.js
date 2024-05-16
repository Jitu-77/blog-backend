import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file
dashboardRouter.route("/stats").get(getChannelStats);
dashboardRouter.route("/videos").get(getChannelVideos);

export {dashboardRouter}