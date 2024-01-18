const express = require('express');
const {
  getUser,
  updateUser,
  deleteUser,
  follow,
  followUser,
  unFollowUser,
} = require('../Controllers/UserController');
const router = express.Router();

router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/followUser', followUser);
router.put('/:id/unfollowUser', unFollowUser);
// router.put('/:userId/follow', follow);

module.exports = router;
