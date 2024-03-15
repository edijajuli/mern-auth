import asynHandler from "express-async-handler";
import User from "../modules/userModul.js";
import generateToken from "../utils/generalToken.js";
//@desc Auth user/set token
//route POST api/users/auth
//@acces public
const authUser = asynHandler(async (req, res) => {
  // res.status(200).json({ message: "Auth User" });
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

//@desc Register the new user
//route POST api/users
//@acces public
const registerUser = asynHandler(async (req, res) => {
  // console.log(req.body);
  const { name, email, password } = req.body;

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
  // res.status(200).json({ message: "Register User" });
});

//@desc Logout user
//route POST api/users/logout
//@acces public
const logoutUser = asynHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
});

//@desc get user profile
//route GET api/users/profile
//@acces private
const getUserProfile = asynHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };
  res.status(200).json(user);
});

//@desc update user profile
//route PUT api/users/profile
//@acces private
const updateUserProfile = asynHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updateUser = await user.save();
    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
  // res.status(200).json({ message: "Update User Profile" });
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
