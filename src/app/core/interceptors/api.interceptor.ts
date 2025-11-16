/**
 * API Base URL HTTP Interceptor
 *
 * This functional HTTP interceptor automatically prepends the base API URL
 * to all outgoing HTTP requests, enabling centralized API endpoint management
 * and simplified service development without hardcoded URLs.
 *
 * Key Concepts Demonstrated:
 * - URL Transformation: Automatic base URL prepending to requests
 * - Centralized Configuration: Single location for API base URL management
 * - Request Modification: Immutable request cloning and URL manipulation
 * - Functional Interceptors: Modern Angular approach for HTTP interception
 * - Environment Abstraction: Base URL can be easily changed for different environments
 *
 * Interceptor Responsibilities:
 * - Transform relative URLs to absolute API URLs
 * - Centralize API base URL configuration
 * - Enable environment-specific API endpoint switching
 * - Simplify service implementations by removing URL duplication
 * - Provide consistent API URL structure across the application
 *
 * URL Transformation Examples:
 * - Input: "/articles" → Output: "https://api.realworld.io/api/articles"
 * - Input: "/users/login" → Output: "https://api.realworld.io/api/users/login"
 * - Input: "/profiles/john" → Output: "https://api.realworld.io/api/profiles/john"
 *
 * Benefits:
 * - DRY Principle: No URL duplication across services
 * - Maintainability: Single location to update API base URL
 * - Environment Flexibility: Easy switching between dev/staging/prod APIs
 * - Service Simplification: Services use relative paths only
 * - Configuration Management: Centralized API endpoint configuration
 *
 * Development Workflow:
 * 1. Services make requests with relative URLs (e.g., "/articles")
 * 2. API interceptor transforms to absolute URLs
 * 3. Requests sent to configured API server
 * 4. Environment changes only require interceptor URL update
 *
 * Environment Considerations:
 * - Development: Local API server URL
 * - Staging: Staging API server URL
 * - Production: Production API server URL
 * - Testing: Mock API server URL
 *
 * Security Considerations:
 * - HTTPS URLs for production environments
 * - API server CORS configuration for cross-origin requests
 * - Environment-specific API keys and authentication
 * - SSL certificate validation for secure connections
 */

import { HttpInterceptorFn } from "@angular/common/http"; // Functional interceptor interface

/**
 * API Base URL Interceptor Function
 *
 * Functional HTTP interceptor that automatically transforms relative URLs
 * to absolute API URLs by prepending the configured base API URL.
 *
 * @param req - HttpRequest: The outgoing HTTP request with relative URL
 * @param next - HttpHandlerFn: The next handler in the interceptor chain
 * @returns Observable<HttpEvent<unknown>>: The processed HTTP response
 *
 * Functional Interceptor Pattern:
 * - HttpInterceptorFn: Modern Angular interface for functional interceptors
 * - Simple function signature without class boilerplate
 * - Direct export for easy configuration and testing
 * - Better tree-shaking and reduced bundle size
 *
 * URL Transformation Strategy:
 * - Assumes all requests use relative URLs starting with "/"
 * - Prepends base API URL to create absolute URLs
 * - Maintains request path, query parameters, and fragments
 * - Preserves all other request properties (headers, method, body)
 *
 * Learning Notes:
 * - Functional interceptors are cleaner than class-based alternatives
 * - URL transformation is a common use case for HTTP interceptors
 * - Interceptors enable cross-cutting concerns like URL management
 * - Request cloning maintains immutability principles
 *
 * Integration with Other Interceptors:
 * - Works alongside token interceptor for authentication
 * - Can be combined with error handling interceptors
 * - Interceptor order matters in provider configuration
 * - Each interceptor in chain can modify requests/responses
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  /**
   * Request Cloning with URL Transformation
   *
   * Creates a new request object with the transformed absolute URL
   * while preserving all other request properties and maintaining immutability.
   *
   * URL Construction Process:
   * - Base URL: "https://api.realworld.io/api"
   * - Request URL: req.url (e.g., "/articles")
   * - Result: "https://api.realworld.io/api/articles"
   *
   * HTTP Request Immutability:
   * - req.clone(): Creates new request object (requests are immutable)
   * - url property: Overrides the original relative URL
   * - All other properties preserved: method, headers, body, params
   * - Original request object remains unchanged
   *
   * Base URL Configuration:
   * - Hardcoded: "https://api.realworld.io/api" (RealWorld API spec)
   * - Production ready: Points to live API server
   * - Environment-specific: Can be extracted to configuration
   * - HTTPS protocol: Secure connection for production use
   *
   * Learning Notes:
   * - clone() method required for request modification
   * - Template literal concatenation for URL construction
   * - Base URL should match API server configuration
   * - Consider environment variables for different deployment targets
   *
   * URL Construction Examples:
   *
   * Article Endpoints:
   * - "/articles" → "https://api.realworld.io/api/articles"
   * - "/articles/feed" → "https://api.realworld.io/api/articles/feed"
   * - "/articles/how-to-train-dragons" → "https://api.realworld.io/api/articles/how-to-train-dragons"
   *
   * Authentication Endpoints:
   * - "/users/login" → "https://api.realworld.io/api/users/login"
   * - "/users" → "https://api.realworld.io/api/users"
   * - "/user" → "https://api.realworld.io/api/user"
   *
   * Profile Endpoints:
   * - "/profiles/jake" → "https://api.realworld.io/api/profiles/jake"
   * - "/profiles/jake/follow" → "https://api.realworld.io/api/profiles/jake/follow"
   *
   * Tag Endpoints:
   * - "/tags" → "https://api.realworld.io/api/tags"
   *
   * Configuration Considerations:
   *
   * Environment-Specific URLs:
   * - Development: "http://localhost:3000/api"
   * - Staging: "https://staging-api.example.com/api"
   * - Production: "https://api.realworld.io/api"
   * - Testing: "http://mock-api.test/api"
   *
   * Configuration Patterns:
   * - Environment files: environment.ts, environment.prod.ts
   * - Configuration service: Injectable configuration provider
   * - Runtime configuration: Loaded from external config files
   * - Build-time replacement: Webpack environment variables
   *
   * Alternative Implementation (Environment-based):
   * ```typescript
   * const baseUrl = environment.production
   *   ? 'https://api.realworld.io/api'
   *   : 'http://localhost:3000/api';
   * const apiReq = req.clone({ url: `${baseUrl}${req.url}` });
   * ```
   *
   * Error Handling Considerations:
   * - Invalid URLs will cause runtime errors
   * - Network connectivity issues handled by other interceptors
   * - CORS errors from misconfigured base URLs
   * - SSL certificate issues with HTTPS URLs
   *
   * Performance Implications:
   * - String concatenation overhead minimal
   * - Request cloning has small memory footprint
   * - Runs on every HTTP request
   * - No network overhead (just URL transformation)
   *
   * Testing Strategies:
   * - Mock interceptor for unit tests
   * - Test URL transformation logic
   * - Verify correct absolute URLs generated
   * - Test with different relative URL patterns
   */
  const apiReq = req.clone({ url: `https://api.realworld.io/api${req.url}` });

  /**
   * Request Forwarding to Next Handler
   *
   * Passes the URL-modified request to the next handler in the interceptor chain
   * or to the HTTP backend if this is the last interceptor.
   *
   * Chain Integration:
   * - Modified request continues through interceptor chain
   * - Token interceptor might add authentication headers
   * - Error interceptor might handle response errors
   * - Logging interceptor might track request/response times
   *
   * Interceptor Execution Order:
   * 1. API interceptor: Transforms relative to absolute URLs
   * 2. Token interceptor: Adds authentication headers
   * 3. Logging interceptor: Logs request details
   * 4. HTTP backend: Sends request to server
   * 5. Response flows back through interceptors in reverse order
   *
   * Learning Notes:
   * - next() call required to continue interceptor chain
   * - Observable return enables response processing
   * - Interceptor order configured in app.config.ts providers
   * - Each interceptor can modify requests and responses
   *
   * Chain Configuration Example:
   * ```typescript
   * providers: [
   *   provideHttpClient(
   *     withInterceptors([
   *       apiInterceptor,    // First: URL transformation
   *       tokenInterceptor,  // Second: Authentication
   *       errorInterceptor   // Third: Error handling
   *     ])
   *   )
   * ]
   * ```
   *
   * Response Processing:
   * - This interceptor only modifies requests
   * - Response passes through unchanged
   * - Other interceptors might transform responses
   * - Error responses handled by specialized error interceptors
   *
   * Debugging and Monitoring:
   * - Network tab shows transformed absolute URLs
   * - Logging interceptors can track URL transformations
   * - Request timing includes transformation overhead
   * - Error messages reference final absolute URLs
   */
  return next(apiReq);
};
