const express = require('express');
const bodyParser = require('body-parser');
const bookingController = require('./bookingController');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// API Routes
app.put('/api/bookings/:id', bookingController.updateBooking);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});