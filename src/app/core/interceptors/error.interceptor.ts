/**
 * Global Error Handling HTTP Interceptor
 *
 * This functional HTTP interceptor provides centralized error handling for all
 * HTTP requests, transforming HttpErrorResponse objects into simplified error
 * structures and ensuring consistent error handling across the application.
 *
 * Key Concepts Demonstrated:
 * - Global Error Handling: Centralized error processing for all HTTP requests
 * - Error Transformation: Converting HttpErrorResponse to application-specific format
 * - RxJS Error Handling: Using catchError operator for stream error management
 * - Error Propagation: Re-throwing transformed errors to calling components
 * - Response Pipeline Integration: Processing errors in interceptor chain
 *
 * Error Handling Responsibilities:
 * - Catch all HTTP errors before they reach components/services
 * - Transform complex HttpErrorResponse into simplified error objects
 * - Extract relevant error information from API responses
 * - Provide consistent error structure across application
 * - Enable centralized logging and error reporting
 *
 * Error Flow Process:
 * 1. HTTP request made by service/component
 * 2. Request passes through interceptor chain
 * 3. API server returns error response (4xx/5xx)
 * 4. Error interceptor catches HttpErrorResponse
 * 5. Transforms error to simplified format
 * 6. Re-throws error for component handling
 *
 * HttpErrorResponse Structure (Input):
 * {
 *   error: { errors: { body: ["can't be blank"] } },  // API error details
 *   status: 422,                                       // HTTP status code
 *   statusText: "Unprocessable Entity",               // HTTP status text
 *   url: "https://api.realworld.io/api/articles",     // Request URL
 *   headers: HttpHeaders,                             // Response headers
 *   message: "Http failure response..."              // Angular error message
 * }
 *
 * Transformed Error Structure (Output):
 * {
 *   errors: { body: ["can't be blank"] }  // Simplified API error object
 * }
 *
 * Benefits:
 * - Error Consistency: Uniform error format across all components
 * - Simplified Error Handling: Components work with clean error objects
 * - Centralized Processing: Single location for error transformation
 * - Debugging Enhancement: Cleaner error objects for development
 * - API Abstraction: Hides HttpErrorResponse complexity from components
 *
 * Common HTTP Error Scenarios:
 * - 400 Bad Request: Invalid request parameters or format
 * - 401 Unauthorized: Missing or invalid authentication token
 * - 403 Forbidden: Valid token but insufficient permissions
 * - 404 Not Found: Requested resource doesn't exist
 * - 422 Unprocessable Entity: Validation errors from API
 * - 500 Internal Server Error: Server-side processing errors
 * - Network Errors: Connection timeout, DNS resolution failures
 *
 * Integration with Components:
 * Components receive transformed errors and can handle them consistently:
 *
 * ```typescript
 * this.articlesService.createArticle(articleData).subscribe({
 *   next: (article) => this.handleSuccess(article),
 *   error: (error) => {
 *     // Receives transformed error: { errors: { title: ["can't be blank"] } }
 *     this.handleValidationErrors(error.errors);
 *   }
 * });
 * ```
 */

import { HttpInterceptorFn } from "@angular/common/http"; // Functional interceptor interface
import { throwError } from "rxjs"; // RxJS error creation utility
import { catchError } from "rxjs/operators"; // RxJS error handling operator

/**
 * Error Handling Interceptor Function
 *
 * Functional HTTP interceptor that catches all HTTP errors, transforms
 * HttpErrorResponse objects into simplified error structures, and re-throws
 * them for component-level error handling.
 *
 * @param req - HttpRequest: The outgoing HTTP request (passed through unchanged)
 * @param next - HttpHandlerFn: The next handler in the interceptor chain
 * @returns Observable<HttpEvent<unknown>>: The HTTP response or transformed error
 *
 * Functional Interceptor Benefits:
 * - HttpInterceptorFn: Modern Angular interface for cleaner error handling
 * - Simpler syntax compared to class-based interceptors
 * - Better tree-shaking and reduced bundle size
 * - Direct integration with RxJS operators
 *
 * Error Processing Strategy:
 * - Focuses on response errors (request pass-through)
 * - Uses RxJS catchError for stream error handling
 * - Extracts API error payload from HttpErrorResponse
 * - Maintains error observables for proper async error flow
 *
 * Learning Notes:
 * - Error interceptors typically only process responses
 * - RxJS operators enable clean error transformation
 * - Error streams must be re-thrown to maintain error state
 * - Interceptor order affects error handling behavior
 *
 * Error Transformation Examples:
 *
 * Validation Errors (422):
 * Input: HttpErrorResponse with err.error = { errors: { email: ["is invalid"] } }
 * Output: { errors: { email: ["is invalid"] } }
 *
 * Authentication Errors (401):
 * Input: HttpErrorResponse with err.error = { errors: { message: "Unauthorized" } }
 * Output: { errors: { message: "Unauthorized" } }
 *
 * Server Errors (500):
 * Input: HttpErrorResponse with err.error = { errors: { server: ["Internal error"] } }
 * Output: { errors: { server: ["Internal error"] } }
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  /**
   * Request Processing and Error Handling Pipeline
   *
   * Passes the request to the next handler and sets up error handling
   * using RxJS operators to catch and transform any HTTP errors.
   *
   * RxJS Pipeline Flow:
   * 1. next(req): Forwards request to next interceptor or HTTP backend
   * 2. pipe(): Creates RxJS operator chain for response processing
   * 3. catchError(): Catches any errors in the HTTP response stream
   * 4. throwError(): Re-throws transformed error for component handling
   *
   * Observable Error Handling:
   * - HTTP requests return Observables that can emit errors
   * - catchError operator intercepts error emissions
   * - Error transformation occurs in catchError callback
   * - throwError creates new error Observable with transformed data
   *
   * Learning Notes:
   * - Pipe operator enables functional composition of RxJS operators
   * - catchError prevents error from terminating the Observable stream
   * - Error handling maintains async flow with Observable patterns
   * - Interceptors can modify both successful responses and errors
   *
   * Error Handling Flow Diagram:
   *
   * Request  →  Interceptor Chain  →  HTTP Backend  →  API Server
   *    ↑                                                    ↓
   * Component ← Error Transform ← catchError ← Error Response
   *
   * Alternative Error Handling Patterns:
   *
   * Detailed Error Logging:
   * ```typescript
   * return next(req).pipe(
   *   catchError((err: HttpErrorResponse) => {
   *     console.error('HTTP Error:', {
   *       status: err.status,
   *       url: err.url,
   *       error: err.error
   *     });
   *     return throwError(() => err.error);
   *   })
   * );
   * ```
   *
   * Error Type Classification:
   * ```typescript
   * return next(req).pipe(
   *   catchError((err: HttpErrorResponse) => {
   *     const errorType = err.status >= 500 ? 'server' : 'client';
   *     return throwError(() => ({
   *       type: errorType,
   *       details: err.error
   *     }));
   *   })
   * );
   * ```
   *
   * Retry Logic Integration:
   * ```typescript
   * return next(req).pipe(
   *   retry(3), // Retry failed requests 3 times
   *   catchError((err) => throwError(() => err.error))
   * );
   * ```
   */
  return next(req).pipe(
    /**
     * Error Catching and Transformation
     *
     * Uses RxJS catchError operator to intercept HTTP errors and transform
     * them from complex HttpErrorResponse objects into simplified error structures.
     *
     * @param err - HttpErrorResponse: Angular's HTTP error response object
     * @returns Observable<never>: Error Observable with transformed error data
     *
     * HttpErrorResponse Structure Analysis:
     * - err.error: Contains the actual API response body (our target data)
     * - err.status: HTTP status code (400, 401, 404, 422, 500, etc.)
     * - err.statusText: Human-readable status description
     * - err.url: The URL that caused the error
     * - err.headers: HTTP response headers
     * - err.message: Angular's default error message
     *
     * Transformation Process:
     * 1. Extract err.error property (API response body)
     * 2. Discard HTTP metadata (status, headers, etc.)
     * 3. Pass clean error object to components
     * 4. Maintain async error flow with throwError
     *
     * API Error Format Examples (RealWorld API):
     *
     * Validation Errors (422 Unprocessable Entity):
     * ```json
     * {
     *   "errors": {
     *     "email": ["can't be blank", "is invalid"],
     *     "password": ["can't be blank", "is too short"]
     *   }
     * }
     * ```
     *
     * Authentication Errors (401 Unauthorized):
     * ```json
     * {
     *   "errors": {
     *     "email or password": ["is invalid"]
     *   }
     * }
     * ```
     *
     * Not Found Errors (404 Not Found):
     * ```json
     * {
     *   "errors": {
     *     "article": ["not found"]
     *   }
     * }
     * ```
     *
     * Component Integration Examples:
     *
     * Form Validation Handling:
     * ```typescript
     * this.authService.login(credentials).subscribe({
     *   error: (error) => {
     *     // error = { errors: { email: ["is invalid"] } }
     *     this.displayFieldErrors(error.errors);
     *   }
     * });
     * ```
     *
     * Generic Error Display:
     * ```typescript
     * this.articleService.createArticle(data).subscribe({
     *   error: (error) => {
     *     // error = { errors: { title: ["can't be blank"] } }
     *     this.errorMessages = Object.values(error.errors).flat();
     *   }
     * });
     * ```
     *
     * Learning Notes:
     * - err.error contains the JSON response body from API
     * - HttpErrorResponse wrapper adds HTTP metadata we don't need
     * - Components work with clean { errors: {...} } objects
     * - Consistent error format enables reusable error handling components
     *
     * Error Propagation Mechanics:
     * - throwError() creates Observable that immediately emits error
     * - Arrow function (() => err.error) delays error creation until subscription
     * - Error Observable terminates the stream for proper error handling
     * - Components can use error operators or error callbacks to handle
     *
     * Testing Considerations:
     * - Mock HttpErrorResponse objects with realistic err.error structure
     * - Test error transformation with different HTTP status codes
     * - Verify components receive expected error format
     * - Test error handling integration with form validation
     *
     * Performance Impact:
     * - Minimal overhead: simple property extraction
     * - No network calls or heavy computation
     * - Runs only when errors occur (not on successful requests)
     * - Error transformation faster than full HttpErrorResponse processing
     */
    catchError((err) => throwError(() => err.error)),
  );
};
