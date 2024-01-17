const UserModel = require('../Models/userModel');
const bcrypt = require('bcrypt');

// Register New User

const registerUser = async (req, res) => {
  const { username, firstname, lastname, password } = req?.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    username,
    firstname,
    lastname,
    password: hashedPass,
  });
  try {
    await newUser.save();
    return res
      .status(201)
      .json({ message: 'User Registered Successfully', newUser });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Login User

const loginUser = async (req, res) => {
  const { username, password } = req?.body;
  try {
    const user = await UserModel.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    const validity = await bcrypt.compare(password, user?.password);

    return validity
      ? res.status(200).json({ message: 'Logged In Successfully', user })
      : res.status(400).json({ message: 'Wrong Credentials' });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = { registerUser, loginUser };
