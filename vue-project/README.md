# Frontend Vue Project

This is the Vue.js frontend for the application, powered by Vite.

## Prerequisites

- **Node.js** version `>= 20.19.0` or `>= 22.12.0` must be installed.

### Installing Node.js and npm

**Windows / macOS:**
Download the LTS installer from the [Node.js website](https://nodejs.org/). 
Alternatively, on Windows you can use `winget`:
```cmd
winget install OpenJS.NodeJS.LTS
```
On macOS with Homebrew:
```bash
brew install node@20
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Using NVM (Node Version Manager) - Recommended:**
NVM allows you to easily manage multiple Node.js versions.
- Linux/macOS: Install [nvm](https://github.com/nvm-sh/nvm)
- Windows: Install [nvm-windows](https://github.com/coreybutler/nvm-windows)

Once NVM is installed, you can install and use the required version:
```bash
nvm install 20
nvm use 20
```

**Verify Installation:**
```bash
node -v
npm -v
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dvoron/frontend.git
   ```

2. **Navigate to the project folder:**
   ```bash
   cd frontend/vue-project
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   The application will start on **port `5173`** by default (`http://localhost:5173`). The development server supports hot-reload for a seamless development experience.

## Build for Production

To compile and minify for production, run:
```bash
npm run build
```

## Related Projects

- **[Backend Project](https://github.com/dvoron/backend)** - The Spring Boot backend service.
- **[E2E Project](https://github.com/dvoron/E2E)** - End-to-End Playwright tests.