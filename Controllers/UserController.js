const UserModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
// get a user

const getUser = async (req, res) => {
  const id = req.params?.id;
  try {
    const user = await UserModel.findById(id);
    const { password, ...otherDetails } = user?._doc;
    return user
      ? res.status(200).json(otherDetails)
      : res.status(404).json({ message: 'User Not Found' });
  } catch (error) {
    res.status(500).json(error?.message);
  }
};

// Update User

const updateUser = async (req, res) => {
  const id = req?.params?.id;
  // const { currentUserId, currentUserAdminStatus, password } = req?.body;

  // if (id === currentUserId || currentUserAdminStatus) {
  //   try {
  //     const user = await UserModel.findByIdAndUpdate(id, req.body, {
  //       new: true,
  //     });

  //     return res
  //       .status(200)
  //       .json({ message: 'User Updated Successfully', user });
  //   } catch (error) {
  //     res.status(500).json(error?.message);
  //   }
  // } else {
  //   return res.status(400).json({ message: 'UnAuthorised User' });
  // }

  const { currentUserId, password } = req?.body;

  try {
    const findUser = await UserModel.findById(id);
    if (!findUser) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    const isAdmin = findUser?.isAdmin;

    if (currentUserId === id || isAdmin) {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      return user
        ? res.status(200).json({ user })
        : res.status(503).json({
            message: 'Some error occured why trying to update the user',
          });
    } else {
      return res.status(403).json({ message: 'UnAuthorised' });
    }
  } catch (error) {
    res.status(500).json(error?.message);
  }
};

// delete user

const deleteUser = async (req, res) => {
  const id = req?.params?.id;

  const { currentUserId } = req?.body;
  try {
    const findUser = await UserModel.findById(id);
    if (!findUser) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    const isAdmin = findUser?.isAdmin;

    if (currentUserId === id || isAdmin) {
      const delSuccess = await UserModel.findByIdAndDelete(id);

      return delSuccess
        ? res.status(200).json({ message: 'User Deleted Successfully' })
        : res.status(503).json({
            message:
              'Unable to delete this user due to some error encountered on the process. Please try again later',
          });
    }
    return res.status(403).json({ message: 'UnAuthorised' });
  } catch (error) {
    res.status(500).json(error?.message);
  }
};

// follow user

const followUser = async (req, res) => {
  const id = req?.params?.id;
  const { currentUserId } = req?.body;
  try {
    if (currentUserId === id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const followUser = await UserModel.findById(id);

    // TODO: Checking if the person another user want to follow exist in the db

    if (!followUser) {
      return res.status(404).json({ message: 'User Not Found' });
    }
    const following = await UserModel.findById(currentUserId);

    //TODO: check is the person that wants to follow user already exist in db

    if (!following) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    // TODO: check if the person that wants to fllow user already exist in the user's followers list

    if (followUser.followers.includes(currentUserId)) {
      return res
        .status(400)
        .json({ message: 'You are already following this user' });
    }

    // if(!followUser.followers.includes(currentUserId))

    //TODO: UPDATE FOLLOWER'S ARRAY

    const updateFollower = await followUser.updateOne({
      $push: { followers: currentUserId },
    });

    //Todo: UPDATE FOLLOWING'S ARRAY
    const updateFollowing = await following.updateOne({
      $push: { following: id },
    });

    if (updateFollower && updateFollowing) {
      return res.status(200).json({ message: 'Following' });
    }
  } catch (error) {
    res.status(500).json(error?.message);
  }
};

// TODO: Unfollow user Controller

const unFollowUser = async (req, res) => {
  const id = req?.params?.id;
  // const { currentUserId } = req?.body;

  // TODO: Logged in user id from token
  const currentUserId = req?.user?._id;
  try {
    if (currentUserId === id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // TODO: get user to be unfollowed

    const userToUnFollow = await UserModel.findById(id);

    // TODO: Checking if the user to unfollow doesn't exist in the db

    if (!userToUnFollow) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    // TODO: Get user that wants to unFollow another user

    const userThatWantToUnFollowUser = await UserModel.findById(currentUserId);

    // TODO: Checking if the userThatWantToUnFollowUser doesn't exist in the db

    if (!userThatWantToUnFollowUser) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    // TODO: checking if userThatWantToUnFollowUser exist in  userToUnFollow followers list

    if (!userToUnFollow.followers.includes(currentUserId)) {
      return res.status(400).json({
        message: `You can't perform this action because you are not in his friend's list.`,
      });
    }

    // TODO:if userThatWantToUnFollowUser exist in  userToUnFollow followers list, Do the following

    // TODO: Remove userThatWantToUnFollowUser from  userToUnFollow followers list

    const updateUserFollowersArray = await userToUnFollow.updateOne({
      $pull: { followers: currentUserId },
    });

    // TODO: Remove userToUnFollow m from  userThatWantToUnFollowUser followings list

    const updateUserFollowingArray = await userThatWantToUnFollowUser.updateOne(
      { $pull: { following: id } }
    );

    // TODO: check if the pulling or deleteing operation is successfull before sending success response

    if (updateUserFollowersArray && updateUserFollowingArray) {
      return res.status(200).json({ message: 'Unfollwed' });
    }
  } catch (error) {
    res.status(500).json(error?.message);
  }
};

/**
 * API to follow a user
 * @param userId: The follower
 */
const follow = async (req, res) => {
  try {
    // Params
    const userToFollowId = req.params?.userId;

    // Body
    const userId = req.body?.userId;

    if (!userToFollowId) {
      return res.status(400).json({ message: 'Invalid user provided.' });
    }

    if (!userId) {
      return res.status(403).json({ message: 'Cannot perform this action.' });
    }

    if (userId?.toString() === userToFollowId?.toString()) {
      return res.status(403).json({
        message:
          'Cannot perform this action. Do not be silly. You cannot follow yourself!',
      });
    }

    // Check if user is in the subject followers list
    const userToFollow = await UserModel.findOne({
      _id: userToFollowId,
    });

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isInFollowersList = userToFollow?.followers?.find(
      (user) => user?.toString() === userId?.toString()
    );

    if (isInFollowersList) {
      return res
        .status(400)
        .json({ message: 'You already follow this user... 1' });
    }
    // end of Check if user is in the subject followers list

    // Check if user is in the following list
    const userThatWantsToFollow = await UserModel.findOne({ _id: userId });

    if (!userThatWantsToFollow) {
      return res.status(403).json({ message: 'You cannot perform action' });
    }

    const isInFollowingList = userThatWantsToFollow?.following?.find(
      (user) => user?.toString() === userToFollowId?.toString()
    );

    if (isInFollowingList) {
      return res
        .status(400)
        .json({ message: 'You already follow this user 2' });
    }
    // end  Check if user is in the following list

    const followUser = await UserModel.findOneAndUpdate(
      { _id: userToFollowId },
      {
        $push: {
          followers: userId,
        },
      },
      { new: true }
    );

    if (!followUser) {
      return res.status(500).json({ message: 'Failed to follow user' });
    }

    const updateFollowing = await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          following: userToFollowId,
        },
      },
      { new: true }
    );

    if (!updateFollowing) {
      // TODO: Remove userId from the userToFollow followers at this point
      // !Don't foorget
      return res.status(500).json({ message: 'Failed to follow user' });
    }

    return res.status(202).json({
      message: `${userThatWantsToFollow?.username} has followed ${userToFollow?.username}`,
    });
  } catch (error) {
    const status = error?.statusCode || 500;
    const message = error?.message || 'Failed to follow user';

    res.status(status).json(message);
  }
};

module.exports = {
  getUser,
  updateUser,
  deleteUser,
  followUser,
  follow,
  unFollowUser,
};
