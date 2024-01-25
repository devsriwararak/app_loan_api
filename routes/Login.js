import express from 'express'
import { deleteRegister, getAllRegister, login, postRegister, putRegister } from '../controllers/Login.js'
const route = express.Router()

route.get('/register', getAllRegister)
route.post('/', login)
route.post('/register', postRegister)
route.put('/register', putRegister)
route.delete('/register/:id', deleteRegister)





export default route