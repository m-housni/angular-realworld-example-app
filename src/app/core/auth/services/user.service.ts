// Angular dependency injection decorator
import { Injectable } from "@angular/core";
// RxJS imports for reactive programming patterns
import { Observable, BehaviorSubject } from "rxjs";

// Local service imports
import { JwtService } from "./jwt.service";
// RxJS operators for data transformation and side effects
import { map, distinctUntilChanged, tap, shareReplay } from "rxjs/operators";
// Angular's HTTP client for making API requests
import { HttpClient } from "@angular/common/http";
// User model/interface definition
import { User } from "../user.model";
// Angular router for navigation
import { Router } from "@angular/router";

/**
 * UserService - Core authentication and user management service
 *
 * This service is responsible for:
 * 1. Managing user authentication state throughout the application
 * 2. Handling login/logout operations
 * 3. User registration and profile updates
 * 4. Providing reactive streams for authentication status
 * 5. Coordinating with JWT token management
 *
 * Design Pattern: Uses BehaviorSubject to maintain current user state
 * and provides Observable streams for components to reactively respond
 * to authentication changes.
 */
@Injectable({ providedIn: "root" }) // Singleton service available app-wide
export class UserService {
  /**
   * BehaviorSubject holds the current user state
   * - Starts with null (no user logged in)
   * - BehaviorSubject remembers the last emitted value
   * - New subscribers immediately get the current state
   * - Private to prevent external direct manipulation
   */
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  /**
   * Public Observable stream of the current user
   * - Components subscribe to this to reactively update UI
   * - distinctUntilChanged() prevents unnecessary emissions when user object
   *   reference changes but content is the same
   * - This creates a clean separation between internal state management
   *   and external consumption
   */
  public currentUser = this.currentUserSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  /**
   * Derived Observable that indicates authentication status
   * - Maps user object to boolean (truthy check with !!)
   * - Components can subscribe to this for showing/hiding authenticated content
   * - Automatically updates when currentUser changes
   * - Example: *ngIf="userService.isAuthenticated | async"
   */
  public isAuthenticated = this.currentUser.pipe(map((user) => !!user));

  /**
   * Constructor - Dependency injection of required services
   *
   * @param http - Angular's HttpClient for making API requests to backend
   * @param jwtService - Custom service for managing JWT tokens (save/retrieve/delete)
   * @param router - Angular Router for programmatic navigation after auth operations
   *
   * All dependencies are marked as 'readonly' to prevent accidental reassignment
   * and 'private' to encapsulate them within this service.
   */
  constructor(
    private readonly http: HttpClient,
    private readonly jwtService: JwtService,
    private readonly router: Router,
  ) {}

  /**
   * User Login Method
   *
   * @param credentials - Object containing user's email and password
   * @returns Observable<{ user: User }> - HTTP response wrapped in Observable
   *
   * Flow:
   * 1. Makes POST request to /users/login endpoint
   * 2. Backend validates credentials and returns user data with JWT token
   * 3. tap() operator performs side effect (setAuth) without modifying the stream
   * 4. setAuth() saves token and updates current user state
   * 5. Components subscribing to this can handle success/error in their own logic
   *
   * Usage: userService.login({email, password}).subscribe({...})
   */
  login(credentials: {
    email: string;
    password: string;
  }): Observable<{ user: User }> {
    return this.http
      .post<{ user: User }>("/users/login", { user: credentials })
      .pipe(tap(({ user }) => this.setAuth(user)));
  }

  /**
   * User Registration Method
   *
   * @param credentials - Object with username, email, and password for new user
   * @returns Observable<{ user: User }> - HTTP response with created user data
   *
   * Flow:
   * 1. Makes POST request to /users endpoint (different from login)
   * 2. Backend creates new user account and returns user data with token
   * 3. Automatically logs in the user after successful registration
   * 4. Same side effect pattern as login using tap() and setAuth()
   *
   * Note: API expects { user: credentials } format, not just credentials
   */
  register(credentials: {
    username: string;
    email: string;
    password: string;
  }): Observable<{ user: User }> {
    return this.http
      .post<{ user: User }>("/users", { user: credentials })
      .pipe(tap(({ user }) => this.setAuth(user)));
  }

  /**
   * User Logout Method
   *
   * Synchronous operation that:
   * 1. Calls purgeAuth() to clear all authentication data
   * 2. Navigates user to home page ("/")
   * 3. void operator used because we don't need the navigation promise result
   *
   * No HTTP request needed - logout is purely client-side cleanup
   * since JWTs are stateless (backend doesn't track sessions)
   */
  logout(): void {
    this.purgeAuth();
    void this.router.navigate(["/"]);
  }

  /**
   * Get Current User from Server
   *
   * @returns Observable<{ user: User }> - Current user data from backend
   *
   * This method fetches the current user data from the server using the stored JWT token.
   *
   * Flow:
   * 1. Makes GET request to /user endpoint (token sent automatically by interceptor)
   * 2. Backend validates token and returns current user data
   * 3. tap() operator with object handles both success and error cases:
   *    - next: Updates authentication state with fresh user data
   *    - error: Clears authentication state (token might be expired/invalid)
   * 4. shareReplay(1) caches the last emission and shares it with multiple subscribers
   *    - Prevents multiple HTTP requests if multiple components subscribe
   *    - Replays the last value to new subscribers immediately
   *
   * Usage: Called during app initialization or when validating existing sessions
   */
  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>("/user").pipe(
      tap({
        next: ({ user }) => this.setAuth(user),
        error: () => this.purgeAuth(),
      }),
      shareReplay(1),
    );
  }

  /**
   * Update User Profile
   *
   * @param user - Partial<User> object with fields to update
   * @returns Observable<{ user: User }> - Updated user data from server
   *
   * Flow:
   * 1. Makes PUT request to /user endpoint with partial user data
   * 2. Backend updates user profile and returns complete updated user
   * 3. Updates local state with new user data using currentUserSubject.next()
   *
   * Note: Uses Partial<User> TypeScript utility type, meaning all User properties
   * are optional. This allows updating just specific fields like username or email.
   *
   * Usage: userService.update({ bio: 'New bio', image: 'new-avatar.jpg' })
   */
  update(user: Partial<User>): Observable<{ user: User }> {
    return this.http.put<{ user: User }>("/user", { user }).pipe(
      tap(({ user }) => {
        this.currentUserSubject.next(user);
      }),
    );
  }

  /**
   * Set Authentication State (Private Helper)
   *
   * @param user - Complete user object received from backend
   *
   * This method performs two critical authentication tasks:
   * 1. Saves the JWT token to browser storage (localStorage/sessionStorage)
   *    via jwtService for future API requests
   * 2. Updates the reactive user state by emitting new user through BehaviorSubject
   *
   * Called after successful login, registration, or user data refresh.
   * This triggers all components subscribed to currentUser/isAuthenticated
   * to reactively update their UI.
   */
  setAuth(user: User): void {
    this.jwtService.saveToken(user.token);
    this.currentUserSubject.next(user);
  }

  /**
   * Clear Authentication State (Private Helper)
   *
   * This method performs complete authentication cleanup:
   * 1. Removes JWT token from browser storage via jwtService
   * 2. Sets current user state to null, indicating no authenticated user
   *
   * Called during logout or when authentication errors occur (expired token).
   * This triggers all components to hide authenticated content and show
   * login/register options instead.
   *
   * Important: This is client-side only. JWTs are stateless, so backend
   * doesn't need to be notified about logout.
   */
  purgeAuth(): void {
    this.jwtService.destroyToken();
    this.currentUserSubject.next(null);
  }
}
