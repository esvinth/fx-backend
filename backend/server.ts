import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Set strictQuery before connection
mongoose.set('strictQuery', true);

// MongoDB Connection
mongoose.connect('mongodb+srv://alumini:alumini@cluster0.aipm5qd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Post Schema
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

const Post = mongoose.model('Post', postSchema);

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

app.post('/api/posts', async (req: Request, res: Response) => {
  try {
    const post = new Post(req.body);
    await post.save();
    io.emit('post_created', post);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error creating post' });
  }
});

app.put('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    io.emit('post_updated', post);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error updating post' });
  }
});

app.delete('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    io.emit('post_deleted', req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});