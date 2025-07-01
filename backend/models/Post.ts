import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    id: String,
    name: String,
    role: String,
    avatar: String
  },
  content: {
    type: String,
    required: true
  },
  image: String,
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Post = mongoose.model('Post', postSchema);