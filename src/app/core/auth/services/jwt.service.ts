// Injectable decorator marks this class as a service that can be injected
import { Injectable } from "@angular/core";

/**
 * JWT (JSON Web Token) Service
 *
 * This service is responsible for managing JWT tokens in the browser's localStorage.
 * JWT tokens are used for authentication and authorization in web applications.
 *
 * Key Concepts:
 * - JWT tokens contain encoded user information and are used to authenticate API requests
 * - localStorage is a browser storage mechanism that persists data across browser sessions
 * - This service provides a centralized way to manage token operations throughout the app
 *
 * Usage Pattern:
 * 1. After successful login, save the JWT token using saveToken()
 * 2. Before making authenticated API calls, retrieve the token using getToken()
 * 3. On logout or token expiration, remove the token using destroyToken()
 */
@Injectable({ providedIn: "root" })
export class JwtService {
  /**
   * Retrieves the JWT token from browser's localStorage
   *
   * @returns {string} The JWT token string, or undefined if no token exists
   *
   * Learning Notes:
   * - window.localStorage is a Web API that provides persistent storage
   * - Using bracket notation ["jwtToken"] to access the localStorage item
   * - Returns undefined if the key doesn't exist (JavaScript behavior)
   * - This method is typically called before making authenticated API requests
   */
  getToken(): string {
    return window.localStorage["jwtToken"];
  }

  /**
   * Saves the JWT token to browser's localStorage
   *
   * @param {string} token - The JWT token string to be stored
   * @returns {void}
   *
   * Learning Notes:
   * - This method is typically called after successful user authentication
   * - localStorage.setItem() could also be used: localStorage.setItem("jwtToken", token)
   * - The token will persist even after the browser is closed and reopened
   * - localStorage is synchronous and can store strings only
   *
   * Security Considerations:
   * - localStorage is accessible via JavaScript, making it vulnerable to XSS attacks
   * - Tokens stored here should have reasonable expiration times
   * - Consider using httpOnly cookies for enhanced security in production apps
   */
  saveToken(token: string): void {
    window.localStorage["jwtToken"] = token;
  }

  /**
   * Removes the JWT token from browser's localStorage
   *
   * @returns {void}
   *
   * Learning Notes:
   * - This method is typically called during user logout or when token expires
   * - removeItem() is the proper way to delete a localStorage entry
   * - This will completely remove the key-value pair from storage
   * - After calling this, getToken() will return undefined
   * - It's safe to call removeItem() even if the key doesn't exist
   *
   * Alternative approaches:
   * - Could use: delete window.localStorage["jwtToken"]
   * - Could use: window.localStorage["jwtToken"] = null (but this stores "null" as string)
   * - removeItem() is the recommended approach as it actually deletes the entry
   */
  destroyToken(): void {
    window.localStorage.removeItem("jwtToken");
  }
}
