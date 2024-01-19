const express = require('express');
const {
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getTimeLinePost,
} = require('../Controllers/PostController');

const router = express.Router();

router.post('/createPost', createPost);
router.get('/:id', getPost);
router.put('/updatePost/:id', updatePost);
router.delete('/deletePost', deletePost);
router.put('/like-dislike-post/:id', likePost);
router.get('/:id/timeline', getTimeLinePost);

module.exports = router;
