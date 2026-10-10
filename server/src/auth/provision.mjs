import { Writable } from 'node:stream';
import { createInterface } from 'node:readline/promises';
import { MongoClient } from 'mongodb';
import { createMongoAuthStore, ensureAuthIndexes } from './store.mjs';
import { provisionUser } from './service.mjs';

async function readPassword() {
  if (!process.stdin.isTTY) {
    let password = '';
    for await (const chunk of process.stdin) {
      password += chunk;
      if (password.length > 1024) throw new Error('Password input is too long.');
    }
    return password.replace(/\r?\n$/, '');
  }
  process.stdout.write('New password (12-128 characters; input hidden): ');
  const output = new Writable({ write(_chunk, _encoding, done) { done(); } });
  const prompt = createInterface({ input: process.stdin, output, terminal: true });
  try { return await prompt.question(''); }
  finally { prompt.close(); process.stdout.write('\n'); }
}

let client;
try {
  const args = process.argv.slice(2);
  if (args.length % 2 || args.some((value, index) => index % 2 === 0 && !['--email', '--name', '--role'].includes(value))) {
    throw new Error('Usage: node --env-file-if-exists=.env src/auth/provision.mjs --email <email> --name <name> --role <student|admin>. Password is read privately from the terminal or stdin; never pass it in command arguments.');
  }
  const fields = Object.fromEntries(Array.from({ length: args.length / 2 }, (_, index) => [args[index * 2].slice(2), args[index * 2 + 1]]));
  if (!fields.email || !fields.name || !['student', 'admin'].includes(fields.role)) throw new Error('Email, name, and an explicit student or admin role are required.');
  if (!process.env.MONGODB_URI) throw new Error('Configure MONGODB_URI before provisioning an account.');
  const password = await readPassword();
  client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const database = client.db(process.env.MONGODB_DATABASE || 'trail_ai_desk');
  await ensureAuthIndexes(database);
  const user = await provisionUser(createMongoAuthStore({ database }), { ...fields, password });
  console.log(`Created ${user.role} account ${user.email}. No default accounts were created.`);
} catch (error) {
  // Avoid printing MongoDB connection errors that could include a URI/secret.
  console.error(error.status || !client ? error.message : 'Account provisioning failed. Check MongoDB connection and server configuration.');
  process.exitCode = 1;
} finally { await client?.close(); }
