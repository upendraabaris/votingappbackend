import mongoose from "mongoose";

const candidateSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    party:{
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    votes: [
        {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        votedAt: { type: Date, default:Date.now() }
        }
    ],
    voteCount: {
        type: Number,
        default: 0
    }
})

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;