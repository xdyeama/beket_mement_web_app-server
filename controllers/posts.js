import mongoose from "mongoose";
import Post from "../models/Post.js";


export const getPost = async (req, res) => { 
    const { id } = req.params;

    try {
        const post = await Post.findById(id);
        
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPosts = async (req, res) => {
    const { page } = req.query;

    try{
        const LIMIT = 8;
        const startIndex = (Number(page)-1)*LIMIT;
        const total = await Post.countDocuments({});

        const posts = await Post.find().sort({_id: -1}).limit(LIMIT).skip(startIndex);
        res.status(200).json({ data: posts, currentPage: Number(page), totalPages: Math.ceil(total/LIMIT)});
    }catch(error){
        res.status(404).json({message: error.message});
    }
}

export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, "i");

        const posts = await Post.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]}).exec();

        res.json({ data: posts });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const post = req.body;
    const newPost = new Post({...post, creator: req.userId , createdAt: new Date().toISOString()})
    try{    
        await newPost.save();
        res.status(200).json(newPost);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, message, creator, selectedFile, tags} = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with that id: ${id}`);
    try{

        const updatedPost = { creator, title, message, tags, selectedFile, _id: id };
        
        await Post.findByIdAndUpdate(
            id, updatedPost, { new: true }
        );
        res.status(200).json(updatedPost);
    }catch(err){
        res.status(500).json(err.message);
    }
}

export const deletePost = async (req, res) => {
    try{
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("No post with that id");

        await Post.findByIdAndRemove(id);
        res.status(200).json("Memory has been deleted");
    }catch(err){
        res.status(500).json(err);
    }
}

export const likePost = async (req, res) => {
    const { id } = req.params;

    if (!req.userId) return res.json({ message: "Unauthenticated user"});

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("Not Found");
    
    const post = await Post.findById(id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1){
        post.likes.push(req.userId);
    }else{
        post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    try{
        const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true })

        res.status(200).json(updatedPost)
    }catch(err){
        res.status(500).json(err)
    }
}

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    
    try{
        const post = await Post.findById(id);

        post.comments.push(value);

        const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true});

        res.status(200).json(updatedPost)

    }catch(error){
        res.status(500).json(error)
    }
}