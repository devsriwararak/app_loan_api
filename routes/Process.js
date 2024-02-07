import express from 'express'
import { authenticationToken } from '../Middleware/Auth.js'
import { getProcessTitle, getProcessUserByProcessId, getUserListByProcessUserId, postNewProcess, postNewProcessUser, putUserList } from '../controllers/Process.js'
const route = express.Router()

route.get('/title', authenticationToken, getProcessTitle )
route.post('/', authenticationToken, postNewProcess )

// users
route.get('/user', authenticationToken, getProcessUserByProcessId)
route.post('/user', authenticationToken , postNewProcessUser)
route.get('/user/list' , authenticationToken , getUserListByProcessUserId)
route.put('/user/list', authenticationToken, putUserList)







export default route