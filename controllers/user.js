import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'


export const signin = async (req, res) => {
    const { email, password } = req.body;

    try{
        const existingUser = await User.findOne({ email });

        if (!existingUser) return res.status(404).json({message: "User not found."});

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) return res.status(400).json({nessage: "Password does not match"});

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id}, "IXmLFJ9cY9", {expiresIn: "1h"});
    
        res.status(200).json({result: existingUser, token});
    }catch(err){
        res.status(500).json({ message: "Something went wrong. Try signing later"})
    }
}

export const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` });

    const token = jwt.sign( { email: result.email, id: result._id }, "IXmLFJ9cY9", { expiresIn: "1h" } );

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: error });
  
    console.log(error);
  }
};

