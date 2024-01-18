const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profilePicture: String,
    coverPicture: String,
    about: String,
    livesIn: String,
    workedAt: String,
    relationship: String,
    // followers: [
    //   {
    //     type: mongoose.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    // following: [
    //   {
    //     type: mongoose.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    followers: [String],
    following: [String],
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
