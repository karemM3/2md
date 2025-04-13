// Import message models
import { Message, Conversation } from './db/models/message.model';
import path from 'path';
import fs from 'fs';

// ... existing code ... <login route>

app.post('/api/auth/login', (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        // Return safe user without password
        const safeUser = { ...user };
        delete safeUser.password;
        return res.status(200).json(safeUser);
      });
    })(req, res, next);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid login data' });
  }
});

// MESSAGING ROUTES
// Get conversations for the current user
app.get('/api/conversations', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .lean();

    // For each conversation, fetch the other participant's details
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipantId = conversation.participants.find(
          (p) => p.toString() !== userId.toString()
        );

        // Fetch the other user's details (replace with your User model query)
        const otherUser = await db.selectOne('user', { id: otherParticipantId }).catch(() => null);

        return {
          ...conversation,
          otherUser: otherUser ? {
            id: otherUser.id,
            name: otherUser.name,
            avatar: otherUser.avatar || null,
          } : null,
          unreadCount: conversation.unreadCount[userId] || 0,
        };
      })
    );

    res.status(200).json(conversationsWithUsers);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
app.get('/api/conversations/:conversationId/messages', authenticateUser, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user.id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Update unread count in conversation
    const unreadCount = { ...conversation.unreadCount.toObject() };
    unreadCount[userId] = 0;
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { 'unreadCount': unreadCount }
    });

    res.status(200).json(messages);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch messages' });
  }
});

// Create or get conversation with another user
app.post('/api/conversations', authenticateUser, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Create new conversation
    const newConversation = new Conversation({
      participants: [userId, recipientId],
      lastMessage: '',
      lastMessageDate: new Date(),
      unreadCount: {},
    });

    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: error.message || 'Failed to create conversation' });
  }
});

// Send a message
app.post('/api/conversations/:conversationId/messages', authenticateUser, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content && (!req.files || Object.keys(req.files).length === 0)) {
      return res.status(400).json({ message: 'Message content or attachment is required' });
    }

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Get the recipient ID (the other participant)
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    // Process attachments if any
    const attachments: string[] = [];
    if (req.files && Object.keys(req.files).length > 0) {
      const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

      for (const file of files) {
        const fileExt = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join('uploads', 'messages', fileName);

        // Ensure directory exists
        const uploadDir = path.join('uploads', 'messages');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save file
        await file.mv(path.join(uploadDir, fileName));
        attachments.push(`/uploads/messages/${fileName}`);
      }
    }

    // Create the message
    const newMessage = new Message({
      senderId: userId,
      receiverId: recipientId,
      conversationId,
      content: content || '',
      attachments,
      isRead: false,
    });

    await newMessage.save();

    // Update the conversation with last message info
    const unreadCount = { ...conversation.unreadCount.toObject() };
    unreadCount[recipientId] = (unreadCount[recipientId] || 0) + 1;

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content || 'Sent an attachment',
      lastMessageDate: new Date(),
      unreadCount,
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message || 'Failed to send message' });
  }
});

// Get total unread message count for current user
app.get('/api/messages/unread-count', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({ participants: userId });

    // Sum up all unread messages
    let totalUnread = 0;
    conversations.forEach(conversation => {
      totalUnread += conversation.unreadCount[userId] || 0;
    });

    res.status(200).json({ count: totalUnread });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch unread count' });
  }
});

// ... existing code ... <job application submission route>

app.post('/api/jobs/:jobId/applications', authenticateUser, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    // Check if job exists
    const job = await db.selectOne('job', { id: jobId }).catch(() => null);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied
    const existingApplication = await db
      .selectOne('jobApplication', { jobId, userId })
      .catch(() => null);
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Handle file upload if exists
    let resumeUrl = null;
    if (req.files && req.files.resumeFile) {
      const resumeFile = req.files.resumeFile as fileUpload.UploadedFile;
      const fileExt = path.extname(resumeFile.name);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join('uploads', 'resumes', fileName);

      // Ensure directory exists
      const uploadDir = path.join('uploads', 'resumes');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save file
      await resumeFile.mv(path.join(uploadDir, fileName));
      resumeUrl = `/uploads/resumes/${fileName}`;
    }

    // Create application
    const applicationData = {
      id: uuidv4(),
      userId,
      jobId,
      description: req.body.description,
      resumeUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert('jobApplication', applicationData);

    res.status(201).json(applicationData);
  } catch (error: any) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: error.message || 'Failed to submit application' });
  }
});

// ... existing code ... <order creation route>

app.post('/api/services/:serviceId/orders', authenticateUser, async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const userId = req.user.id;

    // Check if service exists
    const service = await db.selectOne('service', { id: serviceId }).catch(() => null);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Validate request data against schema
    const validData = insertOrderSchema.parse({
      ...req.body,
      userId,
      serviceId,
      sellerId: service.userId,
    });

    // Create order in database
    const orderData = {
      id: uuidv4(),
      userId,
      serviceId,
      sellerId: service.userId,
      status: 'pending',
      paymentMethod: validData.paymentMethod || 'credit_card',
      price: service.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert('order', orderData);

    // Send notification to seller
    // You would implement this in a real application

    res.status(201).json(orderData);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
});

// ... existing code ... <rest of the routes>
