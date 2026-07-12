import mongoose from 'mongoose';
import dns from 'node:dns';

function ensureSrvCapableDns() {
  try {
    const servers = dns.getServers();
    const onlyLoopback =
      servers.length > 0 &&
      servers.every((s) => s.startsWith('127.') || s === '::1');
    if (onlyLoopback) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
  } catch {
    return;
  }
}

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[db] MONGODB_URI is missing. Add it to server/.env');
    process.exit(1);
  }

  if (uri.startsWith('mongodb+srv://')) ensureSrvCapableDns();

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`[db] MongoDB connected (${mongoose.connection.name})`);
  } catch (err) {
    console.error('[db] Connection failed:', err.message);
    process.exit(1);
  }
}
