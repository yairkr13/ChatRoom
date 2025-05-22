const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const db = require('./models/index');

// Sync database and start server (For commit)
db.sequelize.sync()
  .then(() => {
    console.log('Database synced');
    
    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
