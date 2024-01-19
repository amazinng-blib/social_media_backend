const PostModel = require('../Models/postModel');
const UserModel = require('../Models/userModel');

const mongoose = require('mongoose');

// TODO: Create New Post

const createPost = async (req, res) => {
  const newPost = new PostModel(req?.body);

  try {
    await newPost.save();
    return res
      .status(201)
      .json({ message: 'Post Created Successfully', newPost });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// TODO: Get a post

const getPost = async (req, res) => {
  const id = req?.params?.id;
  try {
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(200).json({ message: 'No Post Found' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// TODO: Update a post

const updatePost = async (req, res) => {
  const id = req?.params?.id;
  const { userId } = req?.body;

  try {
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'No Post Found' });
    }

    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'You are not Authorised to perform this action' });
    }

    await post.updateOne({ $set: req.body });

    return res.status(200).json({ message: 'Post Updated Successfully' });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// TODO: Delete post

const deletePost = async (req, res) => {
  const { id, userId } = req.query;
  // const { userId } = req?.body;
  try {
    // TODO: Get the post, if post don't exist, throw an error

    const post = await PostModel.findById(id);
    const createdBy = post?.userId;

    if (!post) {
      return res.status(404).json({ message: 'No Post Found' });
    }

    if (createdBy !== userId) {
      return res.status(403).json({
        message: 'Forbidden. You are not authorised to perform this action',
      });
    }

    await post.deleteOne();
    return res.status(200).json({ message: 'Post Deleted Successfully' });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// TODO: Like  a post

const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    const createdBy = post?.userId;
    const hasLikedPost = post.likes.includes(userId);

    if (!post) {
      return res.status(404).json({ message: 'No Post Found' });
    }

    if (!hasLikedPost) {
      await post.updateOne({ $push: { likes: userId } });
      return res.status(200).json({ message: 'Liked', post });
    }

    await post.updateOne({ $pull: { likes: userId } });

    return res.status(200).json({ message: 'Post Disliked', post });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// TODO: Get Timeline Post

const getTimeLinePost = async (req, res) => {
  const userId = req.params.id;

  try {
    const currentUserPost = await PostModel.find({ userId: userId });
    // TODO: match ---
    //  Todo: lookup -- merge document with another model
    // TODO: Project --return part of the agrregation
    const followingPost = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'following',
          foreignField: 'userId',
          as: 'followingPosts',
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);

    const posts = currentUserPost
      .concat(followingPost[0]?.followingPosts)
      .sort((a, b) => b.createdAt - a.createdAt);

    return res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = {
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getTimeLinePost,
};
