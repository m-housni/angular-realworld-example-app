/**
 * Authentication Component
 *
 * This component handles both user login and registration functionality in a single
 * component. It dynamically adapts its behavior based on the current route,
 * demonstrating several key Angular concepts for form handling and authentication.
 *
 * Key Concepts Demonstrated:
 * - Reactive Forms: Type-safe form handling with validation
 * - Dynamic Form Controls: Adding/removing form fields based on authentication type
 * - Route-based Component Behavior: Adapting functionality based on URL
 * - Error Handling: Displaying server-side validation errors
 * - Loading States: Managing UI feedback during async operations
 * - Type Safety: Strongly typed forms and interfaces
 *
 * Component Responsibilities:
 * - Handle user login and registration
 * - Validate form inputs before submission
 * - Display server-side errors from API responses
 * - Navigate users after successful authentication
 * - Manage loading states during API calls
 *
 * Authentication Flow:
 * 1. User navigates to /login or /register
 * 2. Component detects route and configures form accordingly
 * 3. User fills out form with validation feedback
 * 4. Form submission triggers appropriate API call (login/register)
 * 5. Success: Navigate to home page
 * 6. Error: Display validation errors to user
 */

import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import {
  Validators, // Built-in form validators
  FormGroup, // Container for form controls with validation
  FormControl, // Individual form input with validation and value management
  ReactiveFormsModule, // Module for reactive form functionality
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgIf } from "@angular/common";
import { ListErrorsComponent } from "../../shared/components/list-errors.component";
import { Errors } from "../models/errors.model";
import { UserService } from "./services/user.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/**
 * Authentication Form Interface
 *
 * Defines the structure and types for the authentication form controls.
 * This interface ensures type safety throughout the form handling process.
 *
 * @interface AuthForm
 * - email: Required for both login and registration
 * - password: Required for both login and registration
 * - username: Optional, only added for registration forms
 *
 * Learning Notes:
 * - TypeScript interfaces provide compile-time type checking
 * - FormControl<T> provides generic typing for form controls
 * - Optional properties (username?) allow for flexible form structures
 * - Type safety prevents runtime errors and improves developer experience
 *
 * Form Control Types:
 * - FormControl<string>: Strongly typed string inputs
 * - Optional properties enable dynamic form structures
 * - Consistent typing across component methods and templates
 */
interface AuthForm {
  email: FormControl<string>;
  password: FormControl<string>;
  username?: FormControl<string>; // Optional: only present for registration
}

/**
 * Component Decorator Configuration
 *
 * Configures the component metadata for Angular's compilation and
 * dependency injection systems.
 */
@Component({
  /**
   * Component Selector
   *
   * @selector "app-auth-page"
   * - Defines the HTML tag for this component
   * - Used in routing configuration to render this component
   * - Follows naming convention: app-[feature]-[type]
   * - "auth-page" indicates this is a full page component for authentication
   *
   * Learning Notes:
   * - Page components often have "page" suffix in selector
   * - Clear naming helps distinguish between page and feature components
   * - Used by Angular router to instantiate component
   */
  selector: "app-auth-page",

  /**
   * External Template File
   *
   * @templateUrl "./auth.component.html"
   * - Points to external HTML template for separation of concerns
   * - Template likely contains form structure, error display, and navigation
   * - Enables better IDE support and maintainability
   *
   * Learning Notes:
   * - External templates preferred for complex forms
   * - Separation of presentation logic from business logic
   * - Better tooling support for HTML editing and validation
   */
  templateUrl: "./auth.component.html",

  /**
   * Component Imports (Standalone Dependencies)
   *
   * Lists all Angular modules, components, and directives needed by this component.
   * Modern alternative to NgModule declarations.
   */
  imports: [
    /**
     * RouterLink - Navigation directive for client-side routing
     * - Used for links between login and registration forms
     * - Prevents page reloads during navigation
     * - Integrates with Angular's routing system
     */
    RouterLink,

    /**
     * NgIf - Conditional rendering directive
     * - Shows/hides elements based on component state
     * - Used for displaying loading states, errors, or conditional content
     * - Structural directive that completely removes elements from DOM
     */
    NgIf,

    /**
     * ListErrorsComponent - Custom component for displaying validation errors
     * - Reusable component for showing server-side errors
     * - Handles error formatting and display logic
     * - Provides consistent error presentation across the application
     */
    ListErrorsComponent,

    /**
     * ReactiveFormsModule - Angular reactive forms functionality
     * - Enables FormGroup, FormControl, and form validation
     * - Provides directives for binding forms to template
     * - Essential for type-safe, reactive form handling
     * - Includes form validation and state management
     */
    ReactiveFormsModule,
  ],

  /**
   * Standalone Component Flag
   *
   * @standalone true
   * - Modern Angular component architecture (v14+)
   * - No NgModule dependency required
   * - Direct import of dependencies
   * - Better tree-shaking and performance
   */
  standalone: true,
})

/**
 * Authentication Component Class
 *
 * Implements the core logic for handling user authentication forms.
 * Uses default export to support lazy loading in routing configuration.
 *
 * Learning Notes:
 * - Default export enables lazy loading: () => import('./auth.component')
 * - OnInit interface provides initialization lifecycle hook
 * - Component state management through properties and methods
 */
export default class AuthComponent implements OnInit {
  /**
   * Component State Properties
   *
   * These properties manage the component's state and behavior based on
   * the current authentication context (login vs registration).
   */

  /**
   * Authentication Type Indicator
   *
   * @property authType - string
   * - Determines current authentication mode: "login" or "register"
   * - Extracted from route URL to determine component behavior
   * - Controls form structure and submission logic
   * - Used to show appropriate UI elements and validation
   *
   * Learning Notes:
   * - Route-based component behavior is a common pattern
   * - Single component handling multiple similar use cases
   * - Reduces code duplication between login/register functionality
   */
  authType = "";

  /**
   * Dynamic Page Title
   *
   * @property title - string
   * - Display title that changes based on authentication type
   * - "Sign in" for login, "Sign up" for registration
   * - Used in template to provide clear user feedback
   * - Improves user experience with contextual information
   *
   * Learning Notes:
   * - Dynamic titles improve user understanding
   * - Contextual UI elements enhance user experience
   * - Simple property binding for reactive title updates
   */
  title = "";

  /**
   * Server-Side Error Storage
   *
   * @property errors - Errors
   * - Stores validation errors returned from API calls
   * - Initialized with empty errors object to prevent template errors
   * - Cleared before each form submission to reset state
   * - Used by ListErrorsComponent to display errors to user
   *
   * Learning Notes:
   * - Error state management prevents UI errors
   * - Consistent error structure across different API endpoints
   * - Separation between client-side and server-side errors
   */
  errors: Errors = { errors: {} };

  /**
   * Form Submission Loading State
   *
   * @property isSubmitting - boolean
   * - Tracks whether form submission is in progress
   * - Used to disable form during API calls
   * - Provides loading feedback to prevent double submissions
   * - Reset to false when API call completes (success or error)
   *
   * Learning Notes:
   * - Loading states improve user experience
   * - Prevent duplicate API calls from rapid clicking
   * - Visual feedback for asynchronous operations
   * - Essential for form UX best practices
   */
  isSubmitting = false;

  /**
   * Reactive Form Instance
   *
   * @property authForm - FormGroup<AuthForm>
   * - Strongly typed reactive form for authentication data
   * - Contains email and password controls (username added dynamically)
   * - Provides validation, state management, and value access
   * - Type safety through AuthForm interface
   *
   * Learning Notes:
   * - FormGroup provides container for related form controls
   * - Type safety prevents runtime errors and improves DX
   * - Reactive forms offer better control than template-driven forms
   * - Validation and state management built into form structure
   */
  authForm: FormGroup<AuthForm>;

  /**
   * Modern Component Lifecycle Management
   *
   * @property destroyRef - DestroyRef
   * - Modern Angular service for handling component destruction
   * - Used with takeUntilDestroyed for automatic subscription cleanup
   * - Replaces traditional OnDestroy pattern
   * - Prevents memory leaks from observable subscriptions
   *
   * Learning Notes:
   * - inject() is modern alternative to constructor injection
   * - DestroyRef provides reactive component lifecycle management
   * - Automatic subscription cleanup prevents memory leaks
   * - Part of Angular's reactive programming improvements
   */
  destroyRef = inject(DestroyRef);

  /**
   * Constructor - Dependency Injection and Form Initialization
   *
   * Sets up component dependencies and initializes the reactive form
   * with base controls that are common to both login and registration.
   *
   * @param route - ActivatedRoute for accessing current route information
   * @param router - Router for programmatic navigation after authentication
   * @param userService - UserService for handling authentication API calls
   */
  constructor(
    /**
     * Activated Route Service
     *
     * @param route - ActivatedRoute
     * - Provides access to current route information
     * - Used to determine authentication type from URL path
     * - Enables component to adapt behavior based on route
     * - Access to route parameters, query params, and URL segments
     *
     * Learning Notes:
     * - ActivatedRoute provides reactive route information
     * - Route-based component behavior is powerful pattern
     * - Snapshot provides synchronous access to current route state
     * - Enables dynamic component configuration based on navigation
     */
    private readonly route: ActivatedRoute,

    /**
     * Router Service
     *
     * @param router - Router
     * - Enables programmatic navigation after successful authentication
     * - Used to redirect users to home page after login/registration
     * - Provides navigation methods and route state management
     * - Essential for SPA navigation flow
     *
     * Learning Notes:
     * - Router enables programmatic navigation
     * - Navigation after form submission is common UX pattern
     * - Prevents users from staying on auth page after successful login
     * - Supports both relative and absolute navigation paths
     */
    private readonly router: Router,

    /**
     * Authentication Service
     *
     * @param userService - UserService
     * - Handles authentication API calls (login/register)
     * - Manages user state and authentication tokens
     * - Provides observables for authentication operations
     * - Centralized authentication logic
     *
     * Learning Notes:
     * - Service injection enables separation of concerns
     * - Authentication logic centralized in service layer
     * - Observable patterns for asynchronous operations
     * - Service provides reusable authentication functionality
     */
    private readonly userService: UserService,
  ) {
    /**
     * Form Initialization
     *
     * Creates the reactive form with base controls common to both
     * login and registration. Username control is added dynamically
     * in ngOnInit when needed for registration.
     */
    this.authForm = new FormGroup<AuthForm>({
      /**
       * Email Form Control
       *
       * FormControl Configuration:
       * - Initial value: "" (empty string)
       * - Validators: [Validators.required] - ensures email is provided
       * - nonNullable: true - prevents null values, ensures type safety
       *
       * Learning Notes:
       * - FormControl provides individual input management
       * - Validators array enables multiple validation rules
       * - nonNullable option improves type safety
       * - Required validation prevents empty submissions
       */
      email: new FormControl("", {
        validators: [Validators.required],
        nonNullable: true,
      }),

      /**
       * Password Form Control
       *
       * Similar configuration to email control:
       * - Required validation ensures password is provided
       * - Type safety through nonNullable option
       * - Could be extended with additional validators (minLength, pattern)
       *
       * Learning Notes:
       * - Consistent control configuration across form
       * - Password validation could be enhanced with complexity rules
       * - Form control state management handles validation display
       */
      password: new FormControl("", {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
  }

  /**
   * Component Initialization Lifecycle Hook
   *
   * OnInit is called after component construction and input binding.
   * Used to configure component behavior based on current route and
   * set up dynamic form controls as needed.
   *
   * Learning Notes:
   * - OnInit is ideal for initialization logic that depends on inputs
   * - Constructor should focus on dependency injection
   * - Route-based initialization enables dynamic component behavior
   */
  ngOnInit(): void {
    /**
     * Authentication Type Detection
     *
     * Extracts the authentication type from the current route URL.
     * Uses route.snapshot for synchronous access to current route state.
     *
     * Implementation Details:
     * - route.snapshot.url: Array of URL segments for current route
     * - .at(-1): Gets the last URL segment (modern array method)
     * - !: Non-null assertion (we know this exists based on routing config)
     * - .path: Gets the string value of the URL segment
     *
     * Examples:
     * - /login -> authType = "login"
     * - /register -> authType = "register"
     *
     * Learning Notes:
     * - Route snapshots provide synchronous access to route data
     * - URL-based behavior enables RESTful component design
     * - Non-null assertion (!) should be used carefully with known data
     * - Modern array methods (.at()) improve code readability
     */
    this.authType = this.route.snapshot.url.at(-1)!.path;

    /**
     * Dynamic Title Assignment
     *
     * Sets component title based on authentication type for better UX.
     * Provides clear context to users about current page purpose.
     *
     * Learning Notes:
     * - Ternary operator for simple conditional assignment
     * - Dynamic titles improve user experience and accessibility
     * - Component state drives UI presentation
     */
    this.title = this.authType === "login" ? "Sign in" : "Sign up";

    /**
     * Dynamic Form Control Addition
     *
     * Adds username control to form only for registration.
     * Demonstrates dynamic form structure based on component state.
     *
     * FormGroup.addControl() method:
     * - Dynamically adds new form control to existing form
     * - Maintains form validation and state management
     * - Enables conditional form fields based on component logic
     *
     * Learning Notes:
     * - Dynamic form controls enable flexible form structures
     * - addControl() method maintains form integrity and validation
     * - Registration requires username, login does not
     * - Conditional form structure improves user experience
     */
    if (this.authType === "register") {
      this.authForm.addControl(
        "username",
        new FormControl("", {
          validators: [Validators.required],
          nonNullable: true,
        }),
      );
    }
  }

  /**
   * Form Submission Handler
   *
   * Processes form submission by determining authentication type,
   * calling appropriate service method, and handling response.
   * Demonstrates error handling, loading states, and navigation.
   *
   * Learning Notes:
   * - Method handles both login and registration through single interface
   * - Loading state management prevents duplicate submissions
   * - Error handling provides user feedback for failed operations
   * - Navigation after success completes authentication flow
   */
  submitForm(): void {
    /**
     * Loading State Management
     *
     * Sets loading state to prevent duplicate submissions and provide
     * visual feedback to user during API call processing.
     *
     * Learning Notes:
     * - Loading states essential for good UX during async operations
     * - Prevents users from clicking submit multiple times
     * - Visual feedback shows system is processing request
     */
    this.isSubmitting = true;

    /**
     * Error State Reset
     *
     * Clears previous errors before new submission attempt.
     * Ensures clean state for each authentication attempt.
     *
     * Learning Notes:
     * - Error state management prevents stale error display
     * - Clean slate approach for each form submission
     * - User experience improvement through relevant error display
     */
    this.errors = { errors: {} };

    /**
     * Dynamic API Call Selection
     *
     * Determines which authentication method to call based on authType.
     * Uses conditional logic to select appropriate service method.
     *
     * Type Assertions:
     * - "as" keyword provides type casting for form values
     * - Ensures type safety when passing data to service methods
     * - Required because form.value has optional properties
     *
     * Learning Notes:
     * - Conditional API calls enable single component for multiple use cases
     * - Type assertions bridge type system with runtime behavior
     * - Form value typing requires careful handling of optional properties
     */
    let observable =
      this.authType === "login"
        ? this.userService.login(
            this.authForm.value as { email: string; password: string },
          )
        : this.userService.register(
            this.authForm.value as {
              email: string;
              password: string;
              username: string;
            },
          );

    /**
     * Observable Subscription with Automatic Cleanup
     *
     * Subscribes to authentication observable and handles success/error cases.
     * Uses modern Angular pattern for automatic subscription cleanup.
     *
     * Subscription Management:
     * - takeUntilDestroyed(destroyRef): Automatically unsubscribes when component destroys
     * - Prevents memory leaks from active subscriptions
     * - Modern alternative to manual subscription management
     *
     * Learning Notes:
     * - takeUntilDestroyed prevents memory leaks automatically
     * - Observable pattern for asynchronous operations
     * - Success/error handling provides complete user experience
     */
    observable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      /**
       * Success Handler
       *
       * Called when authentication succeeds (login or registration).
       * Navigates user to home page to complete authentication flow.
       *
       * void operator:
       * - Explicitly ignores return value from router.navigate()
       * - Shows intent that navigation result is not needed
       * - TypeScript best practice for unused return values
       *
       * Learning Notes:
       * - Success navigation completes authentication user journey
       * - void operator shows intentional disregard of return value
       * - Router navigation is typically fire-and-forget operation
       */
      next: () => void this.router.navigate(["/"]),

      /**
       * Error Handler
       *
       * Called when authentication fails (invalid credentials, server errors, etc.).
       * Updates component state to display errors and reset loading state.
       *
       * @param err - Error object containing validation or server errors
       *
       * Error Handling:
       * - Assigns error object to component property for template display
       * - Resets loading state to re-enable form submission
       * - Allows user to retry after addressing errors
       *
       * Learning Notes:
       * - Error handling essential for robust user experience
       * - Server-side errors need to be displayed to user
       * - Loading state reset enables retry functionality
       * - Error object structure should match ListErrorsComponent expectations
       */
      error: (err) => {
        this.errors = err;
        this.isSubmitting = false;
      },
    });
  }
}
