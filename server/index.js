const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const storageRoutes = require('./routes/storage');
const documentRoutes = require('./routes/document');
const modelsRoutes = require('./routes/models');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/api', storageRoutes);
app.use('/api', documentRoutes);
app.use('/api', modelsRoutes);

app.listen(PORT, () => {
  console.log(`Node backend running on http://localhost:${PORT}`);
});
