/**
 * Error Model Interface
 *
 * This interface defines the structure for handling API error responses throughout
 * the application. It provides a standardized way to represent validation errors,
 * server errors, and other error messages that need to be displayed to users.
 *
 * Key Concepts:
 * - Type Safety: Ensures consistent error handling across the application
 * - API Integration: Maps server-side error responses to client-side structures
 * - Error Standardization: Provides uniform error format for all components
 * - User Experience: Enables consistent error display patterns
 *
 * Common Use Cases:
 * - Form validation errors from server
 * - Authentication failures (invalid credentials, etc.)
 * - API operation errors (network, server, business logic)
 * - Field-specific error messages
 *
 * Integration Points:
 * - Used by authentication components for login/registration errors
 * - Consumed by error display components (ListErrorsComponent)
 * - Returned by HTTP interceptors and service methods
 * - Integrated with reactive forms for validation feedback
 *
 * Error Flow:
 * 1. API returns error response with validation details
 * 2. HTTP interceptor or service maps response to Errors interface
 * 3. Component receives and stores error in component state
 * 4. Template displays errors using error display components
 * 5. User addresses errors and resubmits form/operation
 */

/**
 * Errors Interface
 *
 * Defines the structure for error objects used throughout the application.
 * This interface ensures type safety and consistency when handling errors
 * from API responses and displaying them to users.
 *
 * @interface Errors
 * @property {Object} errors - Container object for all error messages
 *
 * Structure Explanation:
 * - Top-level 'errors' property contains all error messages
 * - Nested object uses field names as keys and error messages as values
 * - Supports multiple errors per field and multiple fields with errors
 * - Flexible structure accommodates various API error response formats
 *
 * Learning Notes:
 * - Interface provides compile-time type checking for error handling
 * - Standardized structure enables reusable error display components
 * - Flexible design supports different API error response patterns
 * - Type safety prevents runtime errors when accessing error properties
 */
export interface Errors {
  /**
   * Errors Object Property
   *
   * @property {Object} errors - Dictionary/map of field names to error messages
   *
   * Structure: { [key: string]: string }
   * - key: Field name or error category (e.g., "email", "password", "username")
   * - value: Error message string to display to user
   *
   * Example Error Objects:
   *
   * Authentication Errors:
   * {
   *   errors: {
   *     "email or password": "is invalid",
   *     "email": "can't be blank",
   *     "password": "is too short (minimum is 8 characters)"
   *   }
   * }
   *
   * Registration Errors:
   * {
   *   errors: {
   *     "username": "has already been taken",
   *     "email": "is not a valid email address",
   *     "password": "doesn't match password confirmation"
   *   }
   * }
   *
   * Article Creation Errors:
   * {
   *   errors: {
   *     "title": "can't be blank",
   *     "body": "is too short (minimum is 10 characters)",
   *     "description": "can't be blank"
   *   }
   * }
   *
   * General API Errors:
   * {
   *   errors: {
   *     "server": "Internal server error occurred",
   *     "network": "Unable to connect to server",
   *     "authorization": "You are not authorized to perform this action"
   *   }
   * }
   *
   * Learning Notes:
   *
   * Index Signature Pattern:
   * - { [key: string]: string } is TypeScript's index signature syntax
   * - Allows any string key with string values
   * - Provides flexibility while maintaining type safety
   * - Commonly used for dictionary/map-like objects
   *
   * API Integration Patterns:
   * - Maps directly to common REST API error response formats
   * - Supports Rails/Laravel style validation error responses
   * - Compatible with JSON:API error specification patterns
   * - Flexible enough for custom API error formats
   *
   * Error Display Patterns:
   * - Keys can be used to associate errors with specific form fields
   * - Values provide human-readable messages for user display
   * - Structure supports iteration for displaying multiple errors
   * - Enables both field-specific and general error messaging
   *
   * Type Safety Benefits:
   * - Prevents accessing undefined properties
   * - Ensures error messages are always strings
   * - Enables IDE autocompletion and error detection
   * - Facilitates refactoring and code maintenance
   *
   * Usage in Components:
   * - Typically initialized as empty: { errors: {} }
   * - Updated with API error responses: this.errors = apiErrorResponse;
   * - Cleared before new operations: this.errors = { errors: {} };
   * - Passed to error display components via property binding
   *
   * Integration with Error Display:
   * - ListErrorsComponent iterates over errors object
   * - Object.keys(errors.errors) provides list of error fields
   * - Object.values(errors.errors) provides list of error messages
   * - Enables flexible error presentation patterns
   *
   * Error Handling Best Practices:
   * - Always initialize with empty errors object to prevent template errors
   * - Clear errors before new operations to avoid stale error display
   * - Use consistent error message formatting across API endpoints
   * - Provide meaningful field names that match form control names
   * - Include both field-specific and general error categories as needed
   */
  errors: { [key: string]: string };
}
