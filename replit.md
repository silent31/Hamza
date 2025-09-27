# Overview

This repository contains **Goat Bot V2**, a Facebook Messenger chatbot built using an unofficial Facebook Chat API. It's designed to provide automated responses and interactive features in Facebook group chats and private messages. The bot uses a personal Facebook account to interact with users and supports a modular command system with extensive customization options.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Framework
- **Runtime**: Node.js 16.x with JavaScript/ES2021
- **Entry Point**: `index.js` spawns the main bot process (`Goat.js`)
- **Process Management**: Automatic restart on exit code 2, with comprehensive error handling

## Database Layer
- **Multi-Database Support**: Configurable between JSON, SQLite, and MongoDB
- **Data Models**: Separate controllers for users, threads (groups), dashboard, and global data
- **Auto-Sync**: Optional automatic synchronization of thread data on startup
- **Backup System**: Version-controlled backup and restore functionality

## Authentication & Session Management
- **Facebook Integration**: Cookie-based authentication with automatic refresh
- **Security Features**: 2FA support, user agent spoofing, proxy support
- **Session Persistence**: Automatic cookie validation and renewal
- **Dashboard Auth**: Passport.js with bcrypt password hashing and session management

## Command System
- **Modular Architecture**: Commands stored in `/scripts/cmds/` directory
- **Event System**: Separate event handlers in `/scripts/events/`
- **Permission Levels**: Role-based access control (0=user, 1=admin, 2=bot owner)
- **Alias Support**: Global command aliases with conflict prevention
- **Hot Reload**: Dynamic command loading without restart

## Web Dashboard
- **Framework**: Express.js with ETA templating engine
- **File Management**: Integrated file upload/download with Google Drive integration
- **Security**: Rate limiting, CSRF protection, and reCAPTCHA v2
- **Real-time Features**: Socket.IO for live updates and monitoring

## Utility Framework
- **Localization**: Multi-language support with dynamic text loading
- **Logging**: Color-coded logging system with different severity levels
- **Message Creation**: Unified API for creating rich messages with attachments
- **Time Management**: Timezone-aware operations with moment.js

## Configuration Management
- **Environment-Aware**: Separate dev/production configs
- **JSON Validation**: Runtime configuration validation with detailed error reporting
- **Hot Configuration**: Some settings changeable without restart
- **Command-Specific Configs**: Per-command environment variables and settings

# External Dependencies

## Core Facebook Integration
- **aminul-new-fca**: Unofficial Facebook Chat API for message handling
- **fb-watchman**: Facebook session monitoring
- **Custom Authentication**: Cookie management and session validation

## Database Solutions
- **MongoDB**: mongoose for document-based storage
- **SQLite**: sqlite3 for file-based relational storage
- **JSON**: fs-extra for file-based JSON storage

## Google Services
- **Google Drive API**: File storage and backup management
- **Gmail API**: Automated email notifications and alerts
- **Google OAuth2**: Service authentication and token management

## Web & API Services
- **Express.js**: Web server framework with middleware stack
- **Socket.IO**: Real-time bidirectional communication
- **Passport.js**: Authentication middleware with local strategy
- **Multer**: File upload handling

## Media & Content Processing
- **Canvas**: Image generation and manipulation
- **Cheerio**: HTML parsing for web scraping
- **Axios**: HTTP client for API requests
- **JIMP**: Advanced image processing capabilities

## Development & Monitoring
- **ESLint**: Code quality and style enforcement
- **Nodemailer**: Email sending capabilities
- **reCAPTCHA v2**: Bot protection for web interface
- **MQTT**: Message queuing for distributed operations

## Uptime & Deployment
- **Replit Integration**: Cloud hosting compatibility
- **Uptime Monitoring**: External service integration (UptimeRobot, Better Uptime)
- **Auto-Update System**: GitHub-based update mechanism with version control