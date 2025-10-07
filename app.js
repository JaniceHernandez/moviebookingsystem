const express = require('express');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
app.use(express.json());

app.use('/api/movies', movieRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Internal error:", err);
  res.status(500).json({ ok: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
