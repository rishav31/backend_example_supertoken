#!/usr/bin/env node

/**
 * Dynamic IP Configuration Updater
 * This script updates Postman environment files with your current network IP
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

// Function to get current network IP
function getNetworkIP() {
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    
    return 'localhost';
}

// Get current IP
const currentIP = getNetworkIP();
console.log(`🔍 Current network IP: ${currentIP}`);

// Update Postman Network Environment
const networkEnvPath = './SuperTokens-Backend-Network.postman_environment.json';

if (fs.existsSync(networkEnvPath)) {
    try {
        const networkEnv = JSON.parse(fs.readFileSync(networkEnvPath, 'utf8'));
        
        // Update baseUrl with current IP
        const baseUrlVar = networkEnv.values.find(v => v.key === 'baseUrl');
        if (baseUrlVar) {
            const oldValue = baseUrlVar.value;
            baseUrlVar.value = `http://${currentIP}:8080`;
            
            // Save updated environment
            fs.writeFileSync(networkEnvPath, JSON.stringify(networkEnv, null, '\t'));
            
            console.log(`✅ Updated ${networkEnvPath}`);
            console.log(`   Old: ${oldValue}`);
            console.log(`   New: ${baseUrlVar.value}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${networkEnvPath}:`, error.message);
    }
} else {
    console.log(`⚠️  ${networkEnvPath} not found`);
}

// Display network information
console.log('');
console.log('🌐 Network Configuration:');
console.log(`   Current IP: ${currentIP}`);
console.log(`   Backend URL: http://${currentIP}:8080`);
console.log(`   Health Check: http://${currentIP}:8080/health`);
console.log('');
console.log('📝 CORS Origins automatically include:');
console.log(`   - http://${currentIP}:3000`);
console.log(`   - http://${currentIP}:3001`);
console.log(`   - http://${currentIP}:3002`);
console.log(`   - http://${currentIP}:3003`);
console.log('');
console.log('🚀 Start backend with: npm start or ./start-dynamic.sh');
