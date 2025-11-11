/**
 * Main Entry Point for Angular Application
 *
 * This file serves as the bootstrap entry point for the Angular application.
 * It's responsible for starting up the Angular application and initializing
 * the root component with its configuration.
 *
 * Key Concepts:
 * - This is where Angular takes control and starts rendering the application
 * - Uses the standalone component approach (Angular 14+) instead of NgModules
 * - The bootstrapApplication function replaces the traditional platformBrowserDynamic().bootstrapModule()
 * - This file is referenced in index.html as the main script to load
 *
 * Application Startup Flow:
 * 1. Browser loads index.html
 * 2. index.html references this main.ts file
 * 3. main.ts imports necessary dependencies
 * 4. bootstrapApplication() starts the Angular application
 * 5. AppComponent becomes the root component
 * 6. Application configuration is applied
 */

// Import the bootstrap function for standalone Angular applications
// This function is used to start Angular applications without NgModules
import { bootstrapApplication } from "@angular/platform-browser";

// Import the root component of the application
// This component will be the entry point and parent of all other components
import { AppComponent } from "./app/app.component";

// Import the application configuration
// This contains providers, routing, and other app-wide settings
import { appConfig } from "./app/app.config";

/**
 * Bootstrap the Angular Application
 *
 * This function call starts the Angular application by:
 * 1. Creating an application instance
 * 2. Mounting the AppComponent as the root component
 * 3. Applying the configuration from appConfig
 * 4. Rendering the component tree starting from AppComponent
 *
 * Parameters:
 * @param {Type<any>} AppComponent - The root component class to bootstrap
 * @param {ApplicationConfig} appConfig - Configuration object containing:
 *   - providers: Services, interceptors, guards, etc.
 *   - routing: Route definitions and router configuration
 *   - feature modules: Imported feature configurations
 *
 * Returns:
 * @returns {Promise<ApplicationRef>} - A promise that resolves to the application reference
 *
 * Error Handling:
 * - The .catch() handles any errors that occur during bootstrap
 * - Errors are logged to the console for debugging
 * - Common errors include: missing providers, circular dependencies, or configuration issues
 *
 * Learning Notes:
 * - This is the modern way to bootstrap Angular apps (v14+)
 * - Replaces the older NgModule-based bootstrap approach
 * - Enables tree-shaking and better performance
 * - Allows for more flexible application architecture
 *
 * Traditional vs Modern Approach:
 * Traditional: platformBrowserDynamic().bootstrapModule(AppModule)
 * Modern: bootstrapApplication(AppComponent, appConfig)
 */
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
