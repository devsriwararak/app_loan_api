import express from 'express'
import { authenticationToken } from '../Middleware/Auth.js'
import { UpdateProcess, UpdateProcessUser, getProcessTitle, getProcessUserByProcessId, getUserListByProcessUserId, postNewProcess, postNewProcessUser, putProcessUser, putUserList, putreLoad } from '../controllers/Process.js'
const route = express.Router()

route.get('/title', authenticationToken, getProcessTitle )
route.post('/', authenticationToken, postNewProcess )

// users
route.get('/user', authenticationToken, getProcessUserByProcessId)
route.post('/user', authenticationToken , postNewProcessUser)
route.put('/user' , authenticationToken, putProcessUser)

// User_List
route.get('/user/list' , authenticationToken , getUserListByProcessUserId)
route.put('/user/list', authenticationToken, putUserList)

// reload
route.put('/user/list/reload', authenticationToken , putreLoad)

// update
route.get('/update', authenticationToken, UpdateProcess)
route.get('/update/user', authenticationToken , UpdateProcessUser )







export default route