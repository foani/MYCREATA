/**
 * CreLink Wallet Telegram MiniApp 배포 스크립트
 * 
 * 이 스크립트는 빌드된 MiniApp을 호스팅 서버에 배포하고,
 * Telegram Bot API를 통해 WebApp 설정을 업데이트합니다.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// 필수 환경 변수 확인
const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'DEPLOY_SSH_HOST',
  'DEPLOY_SSH_USER',
  'DEPLOY_SSH_KEY_PATH',
  'DEPLOY_TARGET_DIR'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables in your .env file or environment.');
  process.exit(1);
}

// 배포 설정
const config = {
  // Telegram 설정
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  webAppUrl: process.env.WEB_APP_URL || 'https://crelink.io/mini',
  
  // 빌드 설정
  buildDir: path.resolve(__dirname, '../build'),
  
  // SSH 배포 설정
  sshHost: process.env.DEPLOY_SSH_HOST,
  sshUser: process.env.DEPLOY_SSH_USER,
  sshKeyPath: process.env.DEPLOY_SSH_KEY_PATH,
  targetDir: process.env.DEPLOY_TARGET_DIR,
};

/**
 * 빌드 디렉토리 확인
 */
function checkBuildDir() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(config.buildDir)) {
      reject(new Error(`Build directory not found: ${config.buildDir}`));
      return;
    }
    
    const indexHtmlPath = path.join(config.buildDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      reject(new Error(`index.html not found in build directory: ${indexHtmlPath}`));
      return;
    }
    
    console.log('✅ Build directory verified.');
    resolve();
  });
}

/**
 * SSH를 통한 파일 배포
 */
function deployViaSSH() {
  return new Promise((resolve, reject) => {
    const sshCommand = `rsync -avz --delete -e "ssh -i ${config.sshKeyPath}" ${config.buildDir}/ ${config.sshUser}@${config.sshHost}:${config.targetDir}/`;
    
    console.log(`Deploying to ${config.sshUser}@${config.sshHost}:${config.targetDir}...`);
    
    exec(sshCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`SSH deployment error: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`SSH warning: ${stderr}`);
      }
      
      console.log(stdout);
      console.log('✅ Files deployed successfully.');
      resolve();
    });
  });
}

/**
 * Telegram Bot API 업데이트
 */
async function updateTelegramWebApp() {
  try {
    console.log('Updating Telegram Bot WebApp configuration...');
    
    // 메뉴 버튼 설정
    const menuButtonUrl = `https://api.telegram.org/bot${config.telegramBotToken}/setMyCommands`;
    const menuCommands = [
      { command: 'start', description: 'Start CreLink Wallet' },
      { command: 'wallet', description: 'View your wallet' },
      { command: 'missions', description: 'Complete missions and earn rewards' },
      { command: 'nft', description: 'View your NFT collection' },
      { command: 'referral', description: 'Invite friends and earn rewards' },
      { command: 'settings', description: 'Change app settings' },
      { command: 'help', description: 'Get help using the app' },
    ];
    
    await axios.post(menuButtonUrl, {
      commands: menuCommands
    });
    
    // 웹앱 시작 명령 메뉴 설정
    const webAppMenuUrl = `https://api.telegram.org/bot${config.telegramBotToken}/setChatMenuButton`;
    await axios.post(webAppMenuUrl, {
      menu_button: {
        type: 'web_app',
        text: 'Open Wallet',
        web_app: {
          url: config.webAppUrl
        }
      }
    });
    
    console.log('✅ Telegram Bot WebApp configuration updated.');
  } catch (error) {
    console.error('Error updating Telegram Bot configuration:', error);
    throw error;
  }
}

/**
 * 배포 실행
 */
async function deploy() {
  try {
    console.log('🚀 Starting deployment of CreLink Wallet Telegram MiniApp...');
    
    // 빌드 디렉토리 확인
    await checkBuildDir();
    
    // SSH로 파일 배포
    await deployViaSSH();
    
    // Telegram Bot 설정 업데이트
    await updateTelegramWebApp();
    
    console.log('✅ Deployment completed successfully!');
    console.log(`The WebApp is now available at: ${config.webAppUrl}`);
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// 배포 실행
deploy();
