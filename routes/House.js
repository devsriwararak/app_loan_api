import express from 'express'
import { deleteHouse, postHouse, putHouse } from '../controllers/House.js'
const route = express.Router()

route.post('/', postHouse)
route.put('/', putHouse)
route.delete('/:id', deleteHouse)

export default route