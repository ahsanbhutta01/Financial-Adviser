import express from 'express';
import { getChatLabels, giveAdvice, getChatById, deleteChat, generateCryptoPrompt } from '../controllers/prompt.controllers.js';
import { isAuthenticated } from '../middleware/auth.js';


const router = express.Router()

router.post("/advice",isAuthenticated, giveAdvice)
router.post("/generate-crypto-prompt", isAuthenticated, generateCryptoPrompt)
router.get('/:userEmail', getChatLabels)
router.get('/chat/:chatId', getChatById)
router.delete('/chat/:chatId', deleteChat)



export default router