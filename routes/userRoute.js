import express from 'express';
import User from "../models/userModel.js";
import {jwtAuthMiddleware,generateToken} from "../middleware/auth.js";
const router = express.Router();


// POST route to add a person
router.post('/signup',async(req,res)=>{
    try{
        const data = req.body;

        // Check if there is already an admin user
        const adminUser = await User.findOne({role:'admin'});
        if(data.role === 'admin' && adminUser){
            return res.status(400).json({message:"Admin user already exists"});
        }

        // Validate Aadhar Card Number must have exactly 12 digit
        if(!/^\d{12}$/.test(data.aadharCardNumber)){
            return res.status(400).json({message:"Aadhar card number must be exactly 12 digits"});
        }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({aadharCardNumber:data.aadharCardNumber});
        if(existingUser){
            return res.status(400).json({message:"User with same aadhar card number already exists"});
        }

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();

        const payload = {
            id:response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        return res.status(201).json({data:response,token:token});

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

// Login Route
router.post('/login',async(req,res)=>{
    try{
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber,password} = req.body;

        // Check if aadharCardNumber or password is missing
        if(!aadharCardNumber || !password){
            return res.status(400).json({messgae:"Aadhar card number and password are required"});
        }

        // Find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber:aadharCardNumber});

        // If user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({message:"Invalid aadhar card number or password"});
        }

        // generate Token 
        const payload = {
            id:user.id
        }
        const token = generateToken(payload);

        // resturn token as response
        return res.status(200).json({token:token})
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

// Profile route
router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        return res.status(200).json({user});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

// Update password route
router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userId = req.user.id;
        const {currentPassword,newPassword} = req.body;

        // Check if currentPassword and newPassword are present in the request body
        if(!currentPassword || !newPassword){
            return res.status(400).json({message:"Both currentPassword and newPassword are required"});
        }

        // Find the user by userID
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({message:"Invalid current password"});
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        return res.status(200).json({message:"Password updated"});

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

export default router;


