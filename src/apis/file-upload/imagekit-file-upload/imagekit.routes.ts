// Core Modules
import express from 'express'

// Controllers
import { imageKitUpload } from './imagekit.controllers'

// Initialization
const router = express.Router()

router.post('/imagekit/upload', imageKitUpload)

export default router
