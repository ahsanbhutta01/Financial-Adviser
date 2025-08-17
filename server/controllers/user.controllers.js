import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


async function signUp(req, res) {
   try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
         return res
            .status(400)
            .json({ success: false, msg: "Missing required field(s)" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const userExist = await User.findOne({ email: normalizedEmail });
      if (userExist) {
         return res
            .status(409)
            .json({ success: false, msg: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // Create and save the new user
      const newUser = new User({
         name: name.trim(),
         email: normalizedEmail,
         password: hashPassword,
      });
      await newUser.save();

      const token = await jwt.sign(
         { id: newUser._id }, process.env.SECRET_KEY, { expiresIn: "30d" }
      );

      return res.status(201).cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000 })
         .json(
            {
               success: true,
               msg: "You are registered successfully..",
               name: newUser.name,
            }
         )
   } catch (error) {
      console.error("Error in signUp:", error);
      return res
         .status(500)
         .json({ success: false, msg: "Internal server error" });
   }
}

async function login(req, res) {
   try {
      const { email, password } = req.body;
      if (!email || !password) {
         res
            .status(400)
            .json({ success: false, msg: "Missing required field(s)" });
         return;
      }
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
         res.status(400).json({ success: false, msg: "User does not exist!" });
         return;
      }

      const isUserMatch = await bcrypt.compare(password, user.password);
      if (!isUserMatch) {
         res.status(401).json({ success: false, msg: "Invalid credentials!" });
         return;
      }

      const token = await jwt.sign(
         { id: user._id }, process.env.SECRET_KEY, { expiresIn: "30d" }
      );

      return res.status(201).cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000 })
         .json(
            {
               success: true,
               msg: `Welcome back ${user.name}`,
               name: user.name,
            }
         )
   } catch (error) {
      console.error("Error in signUp:", error);
      return res
         .status(500)
         .json({ success: false, msg: "Internal server error" });
   }
}

async function logout(req, res) {
   try {
      // Clear the token cookie
      res.clearCookie("token");

      return res.status(200).json({ success: true, msg: "Logged out successfully" });
   } catch (error) {
      console.error("Error in logout:", error);
      return res.status(500).json({ success: false, msg: "Internal server error" });
   }
}

async function current(req, res) {
   try {
      const token = req.cookies.token;
      if (!token) {
         return res.status(401).json({ success: false, msg: "No token provided" });
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
         return res.status(404).json({ success: false, msg: "User not found" });
      }
      res.json({ success: true, name: user.name, email: user.email });
   } catch (error) {
      console.error("Error in /user/current:", error);
      res.status(500).json({ success: false, msg: "Internal server error" });
   }
}

export { signUp, login, logout, current };

