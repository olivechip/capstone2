const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Pet = require('../models/pet');
const authRequired = require('../middleware/auth');   

// Test route to check if server works
router.get('/', async (req, res) => {
    try {
      const users = await User.findAll(); 
      res.json(users.rows);
    } catch (error) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Server Error' }); 
    }
  });

// Get user by ID
router.get('/:userid', authRequired, async (req, res) => {
    const { userid } = req.params;
    try {
        const user = await User.find({ id: userid });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get pets owned by current user
router.get('/:userId/pets', authRequired, async (req, res) => {
    const { userId } = req.params;
    try {
      const pets = await Pet.findByOwnerId(userId); 
      res.json(pets);
    } catch (error) {
      console.error('Error fetching pets', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        await User.register({ username, email, password });
        const { token, user } = await User.login({ email, password }); 

        res.status(201).json({ token, user });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, user } = await User.login({ email, password });
        res.json({ token, user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: error.message });
    }
});

// Update user by ID
router.put('/:userid', authRequired, async (req, res) => {
    const { userid } = req.params;
    const updates = req.body;

    if (req.user.userId !== parseInt(userid)) {
        return res.status(403).json({ error: 'Forbidden - You can only update your own profile' });
    }

    try {
        const updatedUser = await User.update(userid, updates);
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete user by ID
router.delete('/:userid', authRequired, async (req, res) => {
    const { userid } = req.params;

    if (req.user.userId !== parseInt(userid)) {
        return res.status(403).json({ error: 'Forbidden - You can only delete your own profile' });
    }

    try {
        const success = await User.delete(userid);
        if (success) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;