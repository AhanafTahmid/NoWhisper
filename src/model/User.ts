import mongoose, { Schema, Document } from "mongoose";

export interface Messages extends Document{
  content: string,
  createdAt: Date
}


const messageSchema:Schema<Messages> = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

//type define 
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date; 
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Messages[];
}

//actual schema for database

const userSchema: Schema<User> = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyCode: { type: String, required: true },
  verifyCodeExpiry: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  isAcceptingMessages: { type: Boolean, default: true },
  messages: [messageSchema]
});


// already || first time 

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", userSchema);

export default UserModel;