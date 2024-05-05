import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { 
    createPlayList,
    updatePlayList,
    deletePlayList,
    getById,
    getAllPlayList,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
 } from "../controllers/playlist.controller.js";

 const playListRouter= Router()

 playListRouter.use(verifyJwt)
 
 playListRouter.route('/create').post(createPlayList);

 playListRouter.route('/update').patch(updatePlayList);

 playListRouter.route('/delete').delete(deletePlayList);

 playListRouter.route('/fetch/:_id').get(getById);

 playListRouter.route('/fetch').get(getAllPlayList);

 playListRouter.route('/add').patch(addVideoToPlaylist);
 
 playListRouter.route('/remove').patch(removeVideoFromPlaylist)


 export {playListRouter}