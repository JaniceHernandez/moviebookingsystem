     const express = require('express');
     const movieRoutes = require('./routes/movieRoutes');
     const path = require('path');

     const app = express();

     app.use(express.json());
     app.use('/api', movieRoutes);

     // Serve static files from the 'public' directory
     app.use(express.static(path.join(__dirname, 'public')));

     const PORT = process.env.PORT || 3000;
     app.listen(PORT, () => {
       console.log(`Server running on port ${PORT}`);
     });