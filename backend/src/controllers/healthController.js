import mongoose from 'mongoose';

export const healthCheck = (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;

  res.json({
    status: mongoReady ? 'OK' : 'DEGRADED',
    mongo: mongoReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};
