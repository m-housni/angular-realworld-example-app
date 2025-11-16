/**
 * Angular Application Configuration
 *
 * Central configuration file for Angular 17+ standalone applications that defines
 * application-wide providers, services, and initialization logic using the modern
 * ApplicationConfig API instead of traditional NgModules.
 *
 * Key Concepts Demonstrated:
 * - Standalone Application Bootstrap: Modern Angular app configuration without NgModules
 * - Provider Configuration: Centralized service and feature provider setup
 * - HTTP Client Setup: Modern HTTP interceptor configuration with functional interceptors
 * - Application Initialization: Custom app startup logic with APP_INITIALIZER
 * - Dependency Injection: Factory functions and service dependencies
 * - Router Configuration: Route provider setup for navigation
 *
 * Configuration Responsibilities:
 * - Bootstrap application with essential providers
 * - Configure HTTP client with interceptor chain
 * - Set up routing with application routes
 * - Initialize authentication state on app startup
 * - Provide application-wide services and utilities
 *
 * Modern Angular Architecture Benefits:
 * - Standalone Components: No NgModule declarations needed
 * - Tree Shaking: Better optimization for unused code
 * - Simplified Setup: Less boilerplate compared to NgModules
 * - Type Safety: Better TypeScript integration
 * - Performance: Reduced bundle size and faster startup
 *
 * ApplicationConfig vs NgModule Comparison:
 *
 * Old NgModule Approach:
 * ```typescript
 * @NgModule({
 *   imports: [RouterModule.forRoot(routes), HttpClientModule],
 *   providers: [JwtService, UserService, HTTP_INTERCEPTORS],
 *   bootstrap: [AppComponent]
 * })
 * export class AppModule {}
 * ```
 *
 * New ApplicationConfig Approach:
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideRouter(routes), provideHttpClient()]
 * };
 * ```
 *
 * Provider Configuration Strategy:
 * - Router: Navigation and route handling
 * - HTTP Client: API communication with interceptor chain
 * - Authentication: User state initialization on app startup
 * - Services: Application-wide singleton services
 *
 * Learning Notes:
 * - ApplicationConfig is the modern way to bootstrap Angular apps
 * - Providers array replaces NgModule providers
 * - Functional providers (provideRouter, provideHttpClient) replace modules
 * - APP_INITIALIZER runs before app components initialize
 * - Multi providers allow multiple initialization functions
 */

import { APP_INITIALIZER, ApplicationConfig } from "@angular/core"; // Core Angular configuration
import { provideRouter } from "@angular/router"; // Modern router provider

import { routes } from "./app.routes"; // Application route definitions
import { provideHttpClient, withInterceptors } from "@angular/common/http"; // HTTP client configuration
import { JwtService } from "./core/auth/services/jwt.service"; // JWT token management service
import { UserService } from "./core/auth/services/user.service"; // User authentication service
import { apiInterceptor } from "./core/interceptors/api.interceptor"; // API URL transformation
import { tokenInterceptor } from "./core/interceptors/token.interceptor"; // JWT token attachment
import { errorInterceptor } from "./core/interceptors/error.interceptor"; // Global error handling
import { EMPTY } from "rxjs"; // RxJS empty observable

/**
 * Authentication Initialization Factory Function
 *
 * Factory function that creates the authentication initialization logic,
 * checking for existing JWT tokens and restoring user state on application startup.
 *
 * @param jwtService - JwtService: Service for JWT token management and validation
 * @param userService - UserService: Service for user authentication and state management
 * @returns () => Observable<User | never>: Initialization function for APP_INITIALIZER
 *
 * Factory Function Pattern:
 * - Returns initialization function that APP_INITIALIZER will execute
 * - Receives dependencies through Angular's DI system
 * - Enables complex initialization logic with service dependencies
 * - Supports both synchronous and asynchronous initialization
 *
 * Authentication Restoration Process:
 * 1. Check if JWT token exists in localStorage
 * 2. If token exists: Fetch current user data from API
 * 3. If no token: Return EMPTY observable (no initialization needed)
 * 4. User state restored before application components initialize
 *
 * APP_INITIALIZER Integration:
 * - Runs during Angular application bootstrap phase
 * - Blocks application startup until initialization completes
 * - Ensures user authentication state ready before components load
 * - Handles both authenticated and unauthenticated scenarios
 *
 * Error Handling Considerations:
 * - Invalid tokens handled by user service error handling
 * - Network failures gracefully handled with fallback
 * - App continues loading even if authentication restoration fails
 * - User can still authenticate manually if initialization fails
 *
 * Learning Notes:
 * - Factory functions enable dependency injection in providers
 * - Ternary operator provides conditional initialization logic
 * - EMPTY observable represents "no action needed" scenario
 * - APP_INITIALIZER supports multiple initialization functions
 *
 * Alternative Implementation with Error Handling:
 * ```typescript
 * export function initAuth(jwtService: JwtService, userService: UserService) {
 *   return () => {
 *     const token = jwtService.getToken();
 *     if (!token) return EMPTY;
 *
 *     return userService.getCurrentUser().pipe(
 *       catchError(() => {
 *         jwtService.destroyToken(); // Clear invalid token
 *         return EMPTY;
 *       })
 *     );
 *   };
 * }
 * ```
 *
 * Synchronous Alternative:
 * ```typescript
 * export function initAuth(jwtService: JwtService, userService: UserService) {
 *   return () => {
 *     if (jwtService.getToken()) {
 *       userService.getCurrentUser().subscribe();
 *     }
 *   };
 * }
 * ```
 */
export function initAuth(jwtService: JwtService, userService: UserService) {
  /**
   * Authentication Initialization Logic
   *
   * Conditional initialization that checks for existing authentication
   * and restores user state if a valid JWT token is found.
   *
   * Conditional Flow:
   * - jwtService.getToken(): Check localStorage for existing JWT token
   * - If token exists: Call userService.getCurrentUser() to restore user state
   * - If no token: Return EMPTY observable (skip initialization)
   *
   * State Restoration Process:
   * 1. JWT token found in localStorage (user previously logged in)
   * 2. getCurrentUser() API call validates token and fetches user data
   * 3. UserService updates BehaviorSubject with current user
   * 4. Components can immediately access authenticated user state
   * 5. Navigation guards work correctly with restored authentication
   *
   * EMPTY Observable Usage:
   * - Represents "no operation needed" for unauthenticated users
   * - Completes immediately without emitting values
   * - Allows APP_INITIALIZER to continue without blocking
   * - Cleaner than returning null or undefined
   *
   * Learning Notes:
   * - Ternary operator provides clean conditional logic
   * - Token existence indicates potential authentication state
   * - Observable return type enables async initialization
   * - EMPTY is RxJS utility for "do nothing" scenarios
   *
   * Real-World Scenarios:
   *
   * Returning User (Token Exists):
   * 1. User previously logged in, JWT stored in localStorage
   * 2. initAuth detects token and calls getCurrentUser()
   * 3. API validates token and returns user data
   * 4. App starts with user already authenticated
   * 5. Protected routes accessible immediately
   *
   * New User (No Token):
   * 1. First-time visitor or logged out user
   * 2. No JWT token in localStorage
   * 3. initAuth returns EMPTY (no initialization)
   * 4. App starts in unauthenticated state
   * 5. User must login to access protected features
   *
   * Invalid Token Scenario:
   * 1. Token exists but is expired or invalid
   * 2. getCurrentUser() call fails with 401 error
   * 3. Error interceptor or service handles token cleanup
   * 4. App starts in unauthenticated state
   * 5. User prompted to login again
   */
  return () => (jwtService.getToken() ? userService.getCurrentUser() : EMPTY);
}

/**
 * Application Configuration Object
 *
 * Central configuration that defines all application providers, services,
 * and initialization logic for the Angular standalone application.
 *
 * ApplicationConfig Structure:
 * - Type: ApplicationConfig interface from @angular/core
 * - providers: Array of provider configurations
 * - Replaces traditional NgModule configuration
 * - Used in main.ts for application bootstrap
 *
 * Provider Organization:
 * 1. Router Configuration: Navigation and route handling
 * 2. HTTP Client Setup: API communication with interceptors
 * 3. Authentication Initialization: User state restoration
 *
 * Modern Angular Benefits:
 * - Tree Shaking: Unused providers automatically removed
 * - Type Safety: Better TypeScript integration than NgModules
 * - Bundle Size: Smaller builds with standalone architecture
 * - Developer Experience: Simpler configuration and testing
 *
 * Learning Notes:
 * - ApplicationConfig is exported for use in main.ts bootstrap
 * - Provider order can matter for some configurations
 * - Each provider contributes specific functionality to the app
 * - Configuration is compile-time optimized for production
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Router Configuration Provider
     *
     * Configures Angular router with application routes using the modern
     * provideRouter function instead of RouterModule.forRoot().
     *
     * @param routes - Route[]: Application route definitions from app.routes.ts
     *
     * Router Provider Features:
     * - Route Definitions: Maps URLs to components and guards
     * - Lazy Loading: Supports code splitting for feature modules
     * - Guard Integration: Authentication and authorization protection
     * - Navigation Services: Router and ActivatedRoute services
     * - URL Serialization: Handles URL parsing and generation
     *
     * Routes Configuration:
     * - Home: Public article feed and authentication
     * - Articles: Article CRUD operations and display
     * - Profiles: User profiles and following functionality
     * - Authentication: Login and registration forms
     * - Settings: User account configuration
     *
     * Modern vs Legacy Comparison:
     *
     * Legacy (NgModule):
     * ```typescript
     * @NgModule({
     *   imports: [RouterModule.forRoot(routes)],
     *   exports: [RouterModule]
     * })
     * ```
     *
     * Modern (Standalone):
     * ```typescript
     * providers: [provideRouter(routes)]
     * ```
     *
     * Learning Notes:
     * - provideRouter replaces RouterModule.forRoot()
     * - Automatic router service registration
     * - Better tree-shaking than module-based configuration
     * - Simpler testing with provider-based setup
     */
    provideRouter(routes),

    /**
     * HTTP Client Configuration with Interceptor Chain
     *
     * Configures Angular's HTTP client with a chain of functional interceptors
     * for API communication, authentication, and error handling.
     *
     * @param withInterceptors - HttpInterceptorFn[]: Array of functional interceptors
     *
     * HTTP Client Features:
     * - RESTful API Communication: GET, POST, PUT, DELETE operations
     * - Interceptor Chain: Request/response transformation pipeline
     * - Observable Integration: RxJS-based async operations
     * - Error Handling: Global error processing and transformation
     * - Type Safety: Generic HTTP operations with TypeScript
     *
     * Interceptor Execution Order:
     * 1. apiInterceptor: Transforms relative URLs to absolute API URLs
     * 2. tokenInterceptor: Attaches JWT authentication tokens to requests
     * 3. errorInterceptor: Handles HTTP errors and transforms responses
     *
     * Request Flow:
     * Component → apiInterceptor → tokenInterceptor → errorInterceptor → HTTP Backend → API
     *
     * Response Flow:
     * API → HTTP Backend → errorInterceptor → tokenInterceptor → apiInterceptor → Component
     *
     * Functional vs Class-Based Interceptors:
     *
     * Legacy (Class-Based):
     * ```typescript
     * @Injectable()
     * export class TokenInterceptor implements HttpInterceptor {
     *   intercept(req: HttpRequest<any>, next: HttpHandler) {
     *     // Implementation
     *   }
     * }
     *
     * providers: [
     *   { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
     * ]
     * ```
     *
     * Modern (Functional):
     * ```typescript
     * export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
     *   // Implementation
     * };
     *
     * provideHttpClient(withInterceptors([tokenInterceptor]))
     * ```
     *
     * Interceptor Responsibilities:
     *
     * API Interceptor:
     * - URL Transformation: "/articles" → "https://api.realworld.io/api/articles"
     * - Environment Configuration: Different base URLs per environment
     * - Centralized Endpoint Management: Single location for API base URL
     *
     * Token Interceptor:
     * - Authentication Header: Adds "Authorization: Token jwt-token-here"
     * - Conditional Attachment: Only adds token if user is authenticated
     * - Token Validation: Ensures valid token format before attachment
     *
     * Error Interceptor:
     * - Error Transformation: HttpErrorResponse → simplified error objects
     * - Global Error Handling: Consistent error processing across app
     * - Error Propagation: Maintains error observables for component handling
     *
     * Learning Notes:
     * - withInterceptors enables functional interceptor configuration
     * - Interceptor order matters for request/response processing
     * - Functional interceptors are simpler than class-based alternatives
     * - HTTP client automatically provided as singleton service
     */
    provideHttpClient(
      withInterceptors([apiInterceptor, tokenInterceptor, errorInterceptor]),
    ),

    /**
     * Application Initialization Provider
     *
     * Configures authentication initialization that runs during application
     * bootstrap to restore user authentication state from stored JWT tokens.
     *
     * APP_INITIALIZER Configuration:
     * - provide: APP_INITIALIZER token for initialization hooks
     * - useFactory: Factory function that creates initialization logic
     * - deps: Dependencies injected into factory function
     * - multi: true - Allows multiple initialization providers
     *
     * Initialization Process:
     * 1. Angular starts application bootstrap
     * 2. APP_INITIALIZER providers execute before component initialization
     * 3. initAuth factory function checks for existing JWT tokens
     * 4. If token found: getCurrentUser() restores authentication state
     * 5. If no token: EMPTY observable completes immediately
     * 6. Application continues with restored or empty authentication state
     *
     * Dependency Injection:
     * - deps: [JwtService, UserService] - Services required by factory
     * - Angular DI resolves dependencies before calling factory
     * - Factory receives injected services as parameters
     * - Enables complex initialization with service dependencies
     *
     * Multi-Provider Pattern:
     * - multi: true allows multiple APP_INITIALIZER providers
     * - Each provider runs independently during bootstrap
     * - Useful for multiple initialization concerns (auth, config, etc.)
     * - All must complete before application starts
     *
     * Real-World Initialization Flow:
     *
     * Cold Start (New Session):
     * 1. User opens application for first time
     * 2. No JWT token in localStorage
     * 3. initAuth returns EMPTY (no initialization)
     * 4. App starts quickly in unauthenticated state
     * 5. Login form available for user authentication
     *
     * Warm Start (Returning User):
     * 1. User previously logged in, JWT token stored
     * 2. initAuth detects token and calls getCurrentUser()
     * 3. API validates token and returns user data
     * 4. UserService updates authentication state
     * 5. App starts with user already authenticated
     * 6. Protected routes immediately accessible
     *
     * Error Scenarios:
     * - Expired Token: getCurrentUser() fails, app starts unauthenticated
     * - Network Error: Initialization fails gracefully, manual login available
     * - Invalid Token: Error handling clears bad token, fresh start
     *
     * Alternative Initialization Patterns:
     *
     * Configuration Loading:
     * ```typescript
     * {
     *   provide: APP_INITIALIZER,
     *   useFactory: (configService: ConfigService) =>
     *     () => configService.loadConfiguration(),
     *   deps: [ConfigService],
     *   multi: true
     * }
     * ```
     *
     * Feature Initialization:
     * ```typescript
     * {
     *   provide: APP_INITIALIZER,
     *   useFactory: (featureService: FeatureService) =>
     *     () => featureService.initialize(),
     *   deps: [FeatureService],
     *   multi: true
     * }
     * ```
     *
     * Learning Notes:
     * - APP_INITIALIZER blocks app startup until completion
     * - Factory functions enable dependency injection in providers
     * - Multi-providers support multiple initialization functions
     * - Initialization should be fast to avoid slow app startup
     * - Error handling crucial for graceful initialization failures
     */
    {
      provide: APP_INITIALIZER, // Angular initialization token
      useFactory: initAuth, // Factory function for auth initialization
      deps: [JwtService, UserService], // Dependencies for factory function
      multi: true, // Allow multiple initialization providers
    },
  ],
};
