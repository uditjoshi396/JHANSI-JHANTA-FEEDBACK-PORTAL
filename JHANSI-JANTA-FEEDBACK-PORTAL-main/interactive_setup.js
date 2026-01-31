const inquirer = require('inquirer');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const questions = [
  {
    type: 'confirm',
    name: 'hasNode',
    message: 'Do you have Node.js installed?',
    default: true,
  },
  {
    type: 'confirm',
    name: 'hasMongo',
    message: 'Do you have MongoDB installed and running?',
    default: true,
  },
  {
    type: 'input',
    name: 'mongoUri',
    message: 'Enter MongoDB URI (default: mongodb://localhost:27017/janata_portal):',
    default: 'mongodb://localhost:27017/janata_portal',
    when: (answers) => answers.hasMongo,
  },
  {
    type: 'input',
    name: 'jwtSecret',
    message: 'Enter JWT Secret (leave blank for default):',
    default: 'your_jwt_secret_here',
  },
  {
    type: 'input',
    name: 'port',
    message: 'Enter server port (default: 5000):',
    default: '5000',
  },
  {
    type: 'confirm',
    name: 'setupServer',
    message: 'Set up the server?',
    default: true,
  },
  {
    type: 'confirm',
    name: 'setupClient',
    message: 'Set up the client?',
    default: true,
  },
];

async function runSetup() {
  console.log('🚀 Janata Feedback Portal Interactive Setup\n');

  const answers = await inquirer.prompt(questions);

  if (!answers.hasNode) {
    console.log('❌ Please install Node.js first from https://nodejs.org/');
    return;
  }

  if (!answers.hasMongo) {
    console.log('❌ Please install MongoDB from https://www.mongodb.com/try/download/community');
    return;
  }

  // Create .env file
  const envContent = `MONGO_URI=${answers.mongoUri}
JWT_SECRET=${answers.jwtSecret}
PORT=${answers.port}
`;

  fs.writeFileSync(path.join('server', '.env'), envContent);
  console.log('✅ Server .env file created');

  if (answers.setupServer) {
    console.log('📦 Installing server dependencies...');
    execSync('cd server && npm install', { stdio: 'inherit' });
    console.log('✅ Server dependencies installed');
  }

  if (answers.setupClient) {
    console.log('📦 Installing client dependencies...');
    execSync('cd client && npm install', { stdio: 'inherit' });
    console.log('✅ Client dependencies installed');
  }

  console.log('\n🎉 Setup complete!');
  console.log('To run the project:');
  console.log('1. Start MongoDB if not already running');
  console.log('2. Run: cd server && npm run dev');
  console.log('3. In another terminal: cd client && npm start');
  console.log('4. Open http://localhost:3000 in your browser');

  const { runNow } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runNow',
      message: 'Would you like to start the servers now?',
      default: false,
    },
  ]);

  if (runNow) {
    console.log('🚀 Starting servers...');
    const serverProcess = spawn('npm', ['run', 'dev'], { cwd: 'server', stdio: 'inherit' });
    const clientProcess = spawn('npm', ['start'], { cwd: 'client', stdio: 'inherit' });

    console.log('✅ Servers started!');
    console.log('Press Ctrl+C to stop');
  }
}

runSetup().catch(console.error);
