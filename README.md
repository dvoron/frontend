# Frontend Vue Project

This is the Vue.js frontend for the application, powered by Vite.

## Prerequisites

- **Node.js** version `>= 26.10.0` must be installed.
- **npm** version `>= 12.2.0` must be installed.

## Setup Instructions

1. **Navigate to the project folder:**
   ```bash
   cd vue-project
   ```

2. **Install Dependencies**
    ```bash
    npm install
   ```
3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   The application will start on **port `5173`** by default (`http://localhost:5173`). The development server supports hot-reload for a seamless development experience.
   Note: The backend service must be running on port `8080` for the API calls to work properly, as the Vite dev server proxies `/api` requests to `http://localhost:8080`.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Type-checks and builds the application for production.
- `npm run test:unit`: Runs unit tests using Vitest.
- `npm run test:coverage`: Runs unit tests with coverage.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run lint:fix`: Lints and automatically fixes issues.
- `npm run format`: Formats the codebase using Prettier.
- `npm run format:check`: Checks if the codebase is formatted properly.

## Related Projects

- **[Backend Project](https://github.com/dvoron/backend)** - The Spring Boot backend service.
- **[E2E Project](https://github.com/dvoron/E2E)** - End-to-End Playwright tests.