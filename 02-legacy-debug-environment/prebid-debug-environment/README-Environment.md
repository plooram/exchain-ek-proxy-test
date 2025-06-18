# ExChain Debug Environment Configuration

## 🔧 Environment Setup

The ExChain Prebid.js Debug Environment is configured to work seamlessly with Windows PowerShell and supports flexible configuration through multiple methods.

## 📁 Configuration Files

### 1. config.js (Primary Configuration)
The main configuration file that provides all environment settings:
- Server configuration (port, host, environment)
- CORS settings for cross-origin requests
- Logging and debug options
- Prebid.js URL configuration
- File storage paths
- PowerShell compatibility settings

### 2. .env File Support (Optional)
If you can create `.env` files, the system supports environment variables:
```bash
PORT=3000
NODE_ENV=development
DEBUG_MODE=true
DEFAULT_PREBID_URL=https://your-prebid-url.com/prebid.js
```

### 3. PowerShell Helper Scripts
Located in `scripts/powershell-helpers.ps1`, providing:
- Server management functions
- Status checking utilities
- Log viewing helpers
- Cleanup functions

## ⚙️ Configuration Options

### Server Settings
- **Port**: Default 3000, configurable via `PORT` environment variable
- **Host**: Default localhost, configurable via `HOST` environment variable
- **Environment**: Development by default, set `NODE_ENV=production` for production

### CORS Configuration
- **Origin**: Allows all origins by default (`*`)
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With

### Debug Features
- **Debug Mode**: Enabled by default for comprehensive logging
- **File Saving**: Automatically saves original and instrumented Prebid.js files
- **Console Logging**: Colored output for better debugging experience

### Prebid.js Configuration
- **Default URL**: Pre-configured with a test Prebid.js URL
- **Override Support**: Can be overridden via query parameter `?url=`
- **File Storage**: Saves both original and debug versions locally

## 🖥️ PowerShell Compatibility

### Native PowerShell Commands
The environment is designed to work with Windows PowerShell:
- Uses `Get-ChildItem` instead of `ls`
- Uses `Remove-Item` instead of `rm`
- Uses `Get-Process` instead of `ps`

### Helper Functions
Load the PowerShell helpers:
```powershell
. .\scripts\powershell-helpers.ps1
```

Available functions:
- `Start-ExchainDebugServer [-Mode dev|production|debug]`
- `Get-ExchainServerStatus`
- `Stop-ExchainDebugServer`
- `Open-ExchainTestPage [-Port 3000]`
- `Get-ExchainLogs`
- `Clear-ExchainTempFiles`

## 🚀 Quick Start Commands

### Start Development Server
```powershell
npm run dev
# OR
Start-ExchainDebugServer -Mode dev
```

### Start Production Server
```powershell
npm start
# OR
Start-ExchainDebugServer -Mode production
```

### Start Debug Server (with inspector)
```powershell
npm run debug
# OR
Start-ExchainDebugServer -Mode debug
```

### Check Server Status
```powershell
Get-ExchainServerStatus
```

### Open Test Page
```powershell
Open-ExchainTestPage
```

## 🔍 Environment Variables

### Supported Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (default: development)
- `DEBUG_MODE` - Enable debug features (default: true)
- `CORS_ORIGIN` - CORS origin setting (default: *)
- `DEFAULT_PREBID_URL` - Default Prebid.js URL
- `SAVE_ORIGINAL_PREBID` - Save original Prebid.js (default: true)
- `SAVE_DEBUG_PREBID` - Save instrumented Prebid.js (default: true)

### Setting Environment Variables in PowerShell
```powershell
# Set for current session
$env:PORT = "8080"
$env:DEBUG_MODE = "true"

# Set permanently (user level)
[Environment]::SetEnvironmentVariable("PORT", "8080", "User")
```

## 🛠️ Troubleshooting

### Port Already in Use
```powershell
# Check what's using port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill processes using the port
Stop-ExchainDebugServer
```

### Permission Issues
Run PowerShell as Administrator if you encounter permission issues with:
- Creating files in the project directory
- Starting servers on reserved ports
- Accessing network connections

### .env File Issues
If you can't create `.env` files due to IDE restrictions:
1. Use the JavaScript `config.js` file instead
2. Set environment variables directly in PowerShell
3. Modify the IDE's global ignore settings

## 📊 Configuration Priority

The configuration system uses the following priority order:
1. Environment variables (highest priority)
2. `.env` file (if available)
3. `config.js` defaults (lowest priority)

This allows for flexible overrides without modifying code files.

---

**Next Step**: Proceed to Phase 2, Step 4 to implement the Express Proxy Server using these configuration settings. 