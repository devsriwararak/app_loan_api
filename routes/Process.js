import express from 'express'
import { authenticationToken } from '../Middleware/Auth.js'
import { UpdateProcess, UpdateProcessUser, deleteProcess, getProcessTitle, getProcessUserByProcessId, getUserListByProcessUserId, postEnd, postNewProcess, postNewProcessUser, postProcessUserClear, postProcressUserSort, putProcessUser, putUserList, putUserListCancel, putreLoad, updateProcess } from '../controllers/Process.js'
const route = express.Router()

// Process
route.get('/', authenticationToken, getProcessTitle )
route.post('/', authenticationToken, postNewProcess )
route.put('/', authenticationToken , updateProcess )
route.delete('/:id', authenticationToken, deleteProcess)

// users
route.get('/user', authenticationToken, getProcessUserByProcessId)
route.post('/user', authenticationToken , postNewProcessUser)
route.post('/user/sort', authenticationToken , postProcressUserSort)
route.post('/user/clear', authenticationToken , postProcessUserClear)
route.put('/user' , authenticationToken, putProcessUser)
route.put('/user/end', authenticationToken , postEnd)

// User_List
route.get('/user/list' , authenticationToken , getUserListByProcessUserId)
route.put('/user/list', authenticationToken, putUserList)
route.put('/user/list/cancel', authenticationToken, putUserListCancel)

// reload
route.put('/user/list/reload', authenticationToken , putreLoad)

// update
route.get('/update', authenticationToken, UpdateProcess)
route.get('/update/user', authenticationToken , UpdateProcessUser )







export default route