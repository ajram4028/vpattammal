const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// In-memory bookings store (replace with DB in production)
const bookings = [];

// POST /book — Booking endpoint
app.post('/book', (req, res) => {
  const { name, mobile, date, unitType, message } = req.body;

  // Server-side validation
  if (!name || !mobile) {
    return res.status(400).json({ success: false, error: 'Name and mobile are required.' });
  }

  const nameRegex = /^[A-Za-z\s]{2,60}$/;
  if (!nameRegex.test(name.trim())) {
    return res.status(400).json({ success: false, error: 'Invalid name. Only letters allowed.' });
  }

  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile.trim())) {
    return res.status(400).json({ success: false, error: 'Invalid mobile number. Must be 10 digits starting with 6–9.' });
  }

  const booking = {
    id: Date.now(),
    name: name.trim(),
    mobile: mobile.trim(),
    date: date || 'Not specified',
    unitType: unitType || 'Not specified',
    message: message || '',
    timestamp: new Date().toISOString()
  };

  bookings.push(booking);

  // Log booking details to console
  console.log('\n========================================');
  console.log('📋 NEW BOOKING RECEIVED');
  console.log('========================================');
  console.log(`ID:        ${booking.id}`);
  console.log(`Name:      ${booking.name}`);
  console.log(`Mobile:    ${booking.mobile}`);
  console.log(`Date:      ${booking.date}`);
  console.log(`Unit Type: ${booking.unitType}`);
  console.log(`Message:   ${booking.message}`);
  console.log(`Time:      ${booking.timestamp}`);
  console.log('========================================\n');

  res.json({ success: true, message: 'Booking confirmed! We will contact you shortly.', bookingId: booking.id });
});

// GET /bookings — Admin view of all bookings
app.get('/bookings', (req, res) => {
  res.json({ success: true, count: bookings.length, bookings });
});

// Fallback: serve index.html for unknown routes (SPA friendly)
app.get('*', (req, res) => {
  // Only fallback HTML routes, not missing files
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => {
  console.log('\n🏛️  Vadivel Pattammal Residences — Server Running');
  console.log(`🌐  Home:    http://localhost:${PORT}`);
  console.log(`🖼️   Gallery: http://localhost:${PORT}/gallery.html`);
  console.log(`📬  Book:    POST http://localhost:${PORT}/book`);
  console.log('──────────────────────────────────────────\n');
});
