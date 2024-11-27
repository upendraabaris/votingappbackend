import express from 'express';
import Candidate from "../models/candidateModel.js";
import User from "../models/userModel.js";
import {jwtAuthMiddleware,generateToken} from "../middleware/auth.js";
const router = express.Router();

const checkAdminRole=async(userID)=>{
    try{
        const user = await User.findById(userID);
        if(user.role === "admin"){
            return true;
        }
    }catch(err){
        return false;
    }
}

// POST route to add a candidate
router.post('/add',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!(await checkAdminRole(req.user.id))){
            return res.status(403).json({message:"user does not have admin role"});
        }
            

        const data = req.body;
        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        res.status(201).json({message:"candidate created successfully",error:false, data:response});
    }catch(err){
        res.status(500).json({error:"Internal Server Error"});
    }
})

// Put route to update a candidate
router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message:"user does not have admin role"});

        const candidateID = req.params.candidateID;
        
        const updatedCandidatedata = req.body;
        
        //update candidate data
        const response = await Candidate.findByIdAndUpdate(candidateID,updatedCandidatedata, {new:true});

        //if not found
        if(!response){
            return res.status(404).json({error:"candidate not found"});
        }

        res.status(200).json({message:"candidate updated successfully",error:false, data:response});
    }catch(err){
        res.status(500).json({error:"Internal Server Error"});
    }
})

// Delete route to delete a candidate
router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message:"user does not have admin role"});

        const candidateID = req.params.candidateID;
        
        
        //delete candidate data
        const response = await Candidate.findByIdAndDelete(candidateID);

        //if not found
        if(!response){
            return res.status(404).json({error:"candidate not found"});
        }

        res.status(200).json({message:"candidate deleted successfully",error:false, data:response});
    }catch(err){
        res.status(500).json({error:"Internal Server Error"});
    }
})

// let's start voting
router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    //no admin can vote
    //user can only vote
    const candidateID = req.params.candidateID;
    const userId = req.user.id;
    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message:"Candidate not found"});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(user.role == "admin"){
            return res.status(403).json({message:"Admin is not allowed to vote"});
        }
        if(user.isVoted){
            return res.status(400).json({message:"You have already voted"});
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true;
        await user.save();

        return res.status(200).json({message:"Vote recorded successfully"});
    }catch(err){
        res.status(500).json({error:"Internal Server Error"});
    }
})

// vote count
router.get("/vote/count",async(req,res)=>{
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount:"desc"});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        })

        return res.status(200).json({message:"success",statusCode:200,data:voteRecord});
    }catch(err){
        res.status(500).json({error:"Internal Server Error"});
    }
})

// Get List of all candidates with only name and party fields
router.get('/',async(req,res)=>{
    try{
        const candidate = await Candidate.find({},'name party _id');
        // console.log(candidate);

        return res.status(200).json({data:candidate});
    }catch(err){
        res.status(500).json({error:"Internal Server Error"});
    }
})

export default router;