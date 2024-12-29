const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const { sequelize, User } = require('./models');
const { Op } = require('sequelize');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);




const seedUsers = async () => {
  try {
    const count = await User.count();
    if (count === 0) {
      const users = [
        {
          email: 'younes04@example.com',
          firstName: 'Younes',
          lastName: 'Mach',
          password: '123456'
        },
        {
          email: 'aymane04@example.com',
          firstName: 'Aymane',
          lastName: 'Badia',
          password: '123456'
        },
      ];

      await User.bulkCreate(users, {
        individualHooks: true
      });
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync();
    console.log('Database synchronized');

    await seedUsers();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();