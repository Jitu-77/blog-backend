import { Router } from "express";
import { heathCheck } from "../controllers/healthCheck.controller.js";

const healthCheckRouter = Router()

healthCheckRouter.route("/status").get(heathCheck)

export {
    healthCheckRouter
}