const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

const generateToken = (userId,email,firstName,lastName) => {
  return jwt.sign({ 
    id: userId , email,firstName,lastName
  }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h'
  });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName,lastName,email, password } = req.body;

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    const token = generateToken(user.id,email,firstName,lastName);

    res.status(201).json({
      message: 'User registered successfully',
      token
    });
  } catch (error) {
    console.error('Registration error:', error);  // Added for better debugging
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ 
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user.id, user.email, user.firstName, user.lastName);

    res.json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};


exports.verifyToken = async (req, res) => {
  try {
    // Since we're using the auth middleware, if we reach here, 
    // the token is valid and req.user contains the decoded token

    // Get the user details if needed
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['id', 'email'] // Only select these fields
    });

    // Calculate remaining time
    const currentTime = Math.floor(Date.now() / 1000);
    const timeToExpiry = req.user.exp - currentTime;

    res.json({
      message: 'Token is valid',
      isValid: true,
      expiresIn: timeToExpiry,
      user: user || null
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      message: 'Error verifying token',
      error: error.message
    });
  }
};
