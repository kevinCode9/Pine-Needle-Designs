import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';
import { logMailerStatus } from './services/mailer.js';

const start = async () => {
  await connectDatabase();
  await logMailerStatus();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`✅ Server running on http://localhost:${config.port}`);
    console.log('🛑 Press Ctrl+C to stop the server');
  });

  setInterval(() => {}, 30000);

  return server;
};

start().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
