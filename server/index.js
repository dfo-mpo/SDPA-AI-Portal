const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const storageRoutes = require('./routes/storage');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api', storageRoutes);

app.listen(PORT, () => {
  console.log(`Node backend running on http://localhost:${PORT}`);
});
