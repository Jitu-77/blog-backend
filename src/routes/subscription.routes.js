import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js"
import {
    toggleSubscription,
    getSubscribersList,
    getSubscribedToList
} from "../controllers/subscription.controller.js"
const subscriptionRoute = Router()


subscriptionRoute.use(verifyJwt)

subscriptionRoute.route("/toggleSubscription").post(toggleSubscription)

subscriptionRoute.route("/getSubscribersList").get(getSubscribersList)

subscriptionRoute.route("/getSubscribedToList").get(getSubscribedToList)



export {subscriptionRoute}
