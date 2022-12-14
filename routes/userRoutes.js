const express = require('express');
const { signUp, logIn, updateMe, protect, updatePassword, getMe, getUser, getAllUser, restrictTo, logOut, forgotPassword, deleteUser, updateUserRole, uploadUserPhoto,  } = require('../controllers/userController');
const router = express.Router();
router.post('/signup',signUp)
router.post('/login', logIn)
router.post('/forgotpassword', forgotPassword)
router.use(protect)
router.get('/logout', logOut)
router.patch('/updateme', uploadUserPhoto, updateMe)
router.get('/me',getMe, getUser)
router.patch('/updatepassword', updatePassword)

router.get('/:id', getUser)
router.use(restrictTo('admin'))
router.get('/', getAllUser)
router
  .route('/:id')
  .delete(deleteUser)
  .patch(updateUserRole)
const userRouter = router;
module.exports = userRouter;