/**
 * Token HTTP Interceptor
 *
 * This functional HTTP interceptor automatically attaches JWT authentication tokens
 * to outgoing HTTP requests, providing seamless authentication for API calls
 * throughout the application without manual token management in each service.
 *
 * Key Concepts Demonstrated:
 * - HTTP Interceptors: Automatic request/response processing
 * - Functional Interceptors: Modern Angular approach (v15+) using functions
 * - JWT Authentication: Automatic token attachment for API security
 * - Request Cloning: Immutable request modification patterns
 * - Conditional Headers: Dynamic header addition based on authentication state
 * - Modern Dependency Injection: inject() function usage in functional context
 *
 * Interceptor Responsibilities:
 * - Retrieve JWT tokens from storage for authenticated requests
 * - Attach Authorization header to requests when token exists
 * - Handle both authenticated and unauthenticated request scenarios
 * - Maintain request immutability through proper cloning
 * - Provide transparent authentication without service-level token management
 *
 * Authentication Flow Integration:
 * 1. User logs in and JWT token is stored via JwtService
 * 2. Application makes API requests through HttpClient
 * 3. Token interceptor automatically attaches stored token to requests
 * 4. API server receives requests with proper authentication headers
 * 5. Server validates tokens and processes authenticated requests
 *
 * Benefits:
 * - Centralized token management: No manual token handling in services
 * - Automatic authentication: All API calls automatically authenticated
 * - Separation of concerns: Authentication logic separate from business logic
 * - Maintainability: Single location for token attachment logic
 * - Consistency: Uniform authentication across all HTTP requests
 *
 * Security Considerations:
 * - Tokens automatically attached to all requests (careful with third-party APIs)
 * - JWT tokens should have reasonable expiration times
 * - HTTPS required for secure token transmission
 * - Consider token refresh mechanisms for long-lived sessions
 *
 * Modern Pattern:
 * - Functional interceptors replace class-based interceptors
 * - Simpler syntax and better tree-shaking
 * - Direct function export without class boilerplate
 * - Modern dependency injection with inject() function
 */

import { inject } from "@angular/core"; // Modern dependency injection function
import { HttpInterceptorFn } from "@angular/common/http"; // Functional interceptor interface
import { JwtService } from "../auth/services/jwt.service"; // JWT token management service

/**
 * Token HTTP Interceptor Function
 *
 * Functional HTTP interceptor that automatically attaches JWT authentication
 * tokens to outgoing HTTP requests when available.
 *
 * @param req - HttpRequest: The outgoing HTTP request to be modified
 * @param next - HttpHandlerFn: The next handler in the interceptor chain
 * @returns Observable<HttpEvent<unknown>>: The processed HTTP response
 *
 * Functional Interceptor Pattern:
 * - HttpInterceptorFn: Modern Angular interface for functional interceptors
 * - Function signature: (req, next) => Observable<HttpEvent<unknown>>
 * - Replaces class-based interceptors with simpler functional approach
 * - Better tree-shaking and reduced boilerplate code
 *
 * Learning Notes:
 * - Functional interceptors are Angular 15+ feature
 * - Simpler than class-based interceptors
 * - Export const with HttpInterceptorFn type
 * - Function parameters provide request and next handler
 *
 * Interceptor Chain:
 * - Multiple interceptors can be chained together
 * - Each interceptor calls next() to continue the chain
 * - Request flows through interceptors in order
 * - Response flows back through interceptors in reverse order
 *
 * Use Cases:
 * - Authentication token attachment (this interceptor)
 * - Request/response logging
 * - Error handling and retry logic
 * - Request/response transformation
 * - Caching mechanisms
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  /**
   * JWT Token Retrieval
   *
   * Retrieves the stored JWT token using the JwtService for potential
   * attachment to the outgoing request.
   *
   * Modern Dependency Injection:
   * - inject(JwtService): Modern function-based dependency injection
   * - Alternative to constructor injection in class-based components
   * - Can be used in functional contexts like interceptors
   * - Provides access to application services
   *
   * Token Management:
   * - .getToken(): Retrieves JWT token from localStorage
   * - Returns token string or undefined if not available
   * - No error handling needed as JwtService handles storage access
   * - Token presence determines whether to add Authorization header
   *
   * Learning Notes:
   * - inject() enables DI in functional interceptors
   * - Modern alternative to traditional constructor injection
   * - JwtService abstracts token storage implementation
   * - Token can be null/undefined for unauthenticated users
   *
   * Service Integration:
   * - JwtService handles token persistence (localStorage)
   * - Interceptor focuses only on token attachment
   * - Clear separation of concerns
   * - Testable through service mocking
   */
  const token = inject(JwtService).getToken();

  /**
   * Request Cloning with Conditional Authorization Header
   *
   * Creates a new request object with authentication header when token exists.
   * Demonstrates immutable request modification and conditional header addition.
   *
   * HTTP Request Immutability:
   * - req.clone(): Creates a new request object (requests are immutable)
   * - Original request object remains unchanged
   * - Modifications applied to cloned request
   * - Ensures interceptor chain integrity
   *
   * Header Configuration:
   * - setHeaders: Object containing headers to add/modify
   * - Spread operator: ...(condition ? object : {})
   * - Conditional header addition based on token availability
   * - Authorization header format: "Token ${tokenValue}"
   *
   * Learning Notes:
   * - HTTP requests are immutable in Angular
   * - clone() method required for request modification
   * - setHeaders adds or overrides request headers
   * - Spread operator enables conditional object properties
   *
   * Conditional Logic Breakdown:
   * - token ? { Authorization: `Token ${token}` } : {}
   * - If token exists: Create Authorization header object
   * - If no token: Use empty object (no additional headers)
   * - Spread operator (...) merges the conditional object
   * - Result: Header added only when authentication token available
   *
   * Authorization Header Format:
   * - "Authorization: Token {jwt-token-string}"
   * - Standard format for JWT-based APIs
   * - "Token" prefix indicates JWT token type
   * - Alternative formats: "Bearer {token}" for OAuth
   * - Server expects specific format for proper authentication
   *
   * Security Implications:
   * - Authorization header contains sensitive authentication data
   * - Automatically added to all outgoing requests
   * - Consider filtering requests to specific domains
   * - HTTPS required to protect token transmission
   *
   * Performance Considerations:
   * - Token retrieval from localStorage is synchronous
   * - Minimal overhead for request cloning
   * - Interceptor runs for every HTTP request
   * - Consider caching token value for high-frequency requests
   */
  const request = req.clone({
    setHeaders: {
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });

  /**
   * Request Forwarding to Next Handler
   *
   * Passes the modified request to the next handler in the interceptor chain
   * or to the HTTP backend if this is the last interceptor.
   *
   * Interceptor Chain Pattern:
   * - next(request): Forwards modified request to next handler
   * - Returns Observable<HttpEvent<unknown>> for response handling
   * - Chain continues until request reaches HTTP backend
   * - Response flows back through chain in reverse order
   *
   * Chain Execution Flow:
   * 1. Request enters interceptor chain
   * 2. Each interceptor processes and modifies request
   * 3. Modified request passed to next() function
   * 4. Final handler sends request to server
   * 5. Response returns through interceptors in reverse order
   * 6. Each interceptor can process response before returning
   *
   * Learning Notes:
   * - next() function is required to continue interceptor chain
   * - Forgetting next() call will break request processing
   * - Observable return enables response processing
   * - Interceptors can handle both request and response
   *
   * Error Handling:
   * - Errors in interceptor chain propagate back through observables
   * - Individual interceptors can catch and handle errors
   * - Failed requests trigger error handlers in calling services
   * - Token-related errors (expired, invalid) handled by other interceptors
   *
   * Response Processing:
   * - This interceptor only modifies requests (no response processing)
   * - Response flows through without modification
   * - Other interceptors might handle response transformation
   * - Error interceptors might retry requests or handle auth failures
   *
   * Observable Pattern:
   * - HTTP interceptors work with Observable streams
   * - Enables reactive programming patterns
   * - Supports request cancellation and retry logic
   * - Integrates with Angular's reactive HTTP client
   */
  return next(request);
};
