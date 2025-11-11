/**
 * IfAuthenticated Custom Structural Directive
 *
 * This is a custom Angular structural directive that conditionally renders content
 * based on the user's authentication status. It's a specialized alternative to
 * using *ngIf with authentication checks throughout the application.
 *
 * Key Concepts:
 * - Structural Directive: Manipulates DOM structure by adding/removing elements
 * - Authentication-aware: Reacts to changes in user authentication state
 * - Reusable Logic: Encapsulates authentication checks for use across components
 * - Reactive: Uses observables to automatically update when auth state changes
 *
 * Usage Examples:
 * - <div *ifAuthenticated="true">Show when logged in</div>
 * - <div *ifAuthenticated="false">Show when logged out</div>
 * - <nav *ifAuthenticated="true">Authenticated navigation</nav>
 *
 * Benefits:
 * - More semantic than generic *ngIf="userService.isAuthenticated"
 * - Centralized authentication logic
 * - Automatic subscription management with proper cleanup
 * - Type-safe and reusable across the application
 *
 * Structural Directive Pattern:
 * - Uses TemplateRef to access the template content
 * - Uses ViewContainerRef to manipulate DOM insertion/removal
 * - Implements OnInit for initialization logic
 * - Handles subscription lifecycle management
 */

import {
  DestroyRef, // Modern Angular service for handling component destruction
  Directive, // Core decorator for creating custom directives
  inject, // Modern dependency injection function
  Input, // Decorator for component input properties
  OnInit, // Lifecycle interface for initialization logic
  TemplateRef, // Reference to the template content of the directive
  ViewContainerRef, // Container for dynamically creating and managing views
} from "@angular/core";

// Import the user service for accessing authentication state
import { UserService } from "./services/user.service";

// Import RxJS operator for automatic subscription cleanup
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/**
 * Directive Decorator Configuration
 *
 * Configures the directive metadata for Angular's dependency injection
 * and template compilation system.
 */
@Directive({
  /**
   * Directive Selector
   *
   * @selector "[ifAuthenticated]"
   * - Attribute directive selector (uses square brackets)
   * - Applied as an attribute: <div *ifAuthenticated="true"></div>
   * - The * prefix indicates this is a structural directive
   * - Angular automatically handles the template transformation
   *
   * Learning Notes:
   * - Structural directives use attribute selectors with brackets
   * - The * syntax is syntactic sugar for <ng-template> wrapping
   * - Angular transforms *ifAuthenticated="true" into proper template syntax
   * - Selector naming should be descriptive and follow camelCase convention
   */
  selector: "[ifAuthenticated]",

  /**
   * Standalone Directive Flag
   *
   * @standalone true
   * - Enables this directive to work without NgModule declarations
   * - Part of Angular's modern component architecture (v14+)
   * - Can be imported directly by components that use it
   * - Improves tree-shaking and reduces bundle size
   */
  standalone: true,
})

/**
 * IfAuthenticated Directive Class
 *
 * Implements the core logic for conditionally rendering content based on
 * authentication state. Uses generic type T for template context typing.
 *
 * @template T - The type of the template context (usually any or specific interface)
 */
export class IfAuthenticatedDirective<T> implements OnInit {
  /**
   * Modern Dependency Injection
   *
   * @property destroyRef - Modern Angular service for handling component lifecycle
   * - Replaces traditional ngOnDestroy for subscription cleanup
   * - Automatically triggers when directive is destroyed
   * - Used with takeUntilDestroyed() for automatic subscription management
   * - Part of Angular's reactive patterns for memory leak prevention
   *
   * Learning Notes:
   * - inject() is the modern alternative to constructor injection
   * - DestroyRef provides a reactive way to handle component destruction
   * - Eliminates need for implementing OnDestroy interface manually
   * - Follows functional programming principles
   */
  destroyRef = inject(DestroyRef);

  /**
   * Constructor Dependency Injection
   *
   * Injects required services and references for directive functionality.
   * Uses traditional constructor injection for complex dependencies.
   *
   * @param templateRef - Reference to the directive's template content
   * @param userService - Service providing authentication state
   * @param viewContainer - Container for managing DOM insertion/removal
   */
  constructor(
    /**
     * Template Reference
     *
     * @param templateRef - TemplateRef<T>
     * - Represents the template content wrapped by this directive
     * - Contains the HTML elements that will be conditionally rendered
     * - Generic type T represents the template's context type
     * - Used to create embedded views when content should be displayed
     *
     * Learning Notes:
     * - TemplateRef is the foundation of structural directives
     * - Represents the template that gets transformed by Angular
     * - Can be used multiple times to create multiple views
     * - Provides access to template context and embedded view creation
     */
    private templateRef: TemplateRef<T>,

    /**
     * Authentication Service
     *
     * @param userService - UserService
     * - Provides access to current user authentication state
     * - Offers reactive streams (observables) for auth status changes
     * - Centralized authentication logic for the entire application
     * - Source of truth for user login/logout state
     *
     * Learning Notes:
     * - Services should be injected as private readonly when possible
     * - Authentication services typically provide observable streams
     * - Centralized auth state prevents inconsistencies across components
     * - Service injection enables testability and modularity
     */
    private userService: UserService,

    /**
     * View Container Reference
     *
     * @param viewContainer - ViewContainerRef
     * - Container where embedded views are inserted into the DOM
     * - Provides methods for creating, removing, and managing views
     * - Acts as the insertion point for conditional content
     * - Manages the lifecycle of dynamically created views
     *
     * Learning Notes:
     * - ViewContainerRef is essential for dynamic content manipulation
     * - Provides fine-grained control over DOM insertion and removal
     * - Manages view hierarchy and change detection integration
     * - Used by structural directives to control template rendering
     */
    private viewContainer: ViewContainerRef,
  ) {}

  /**
   * Directive State Management
   *
   * Internal properties for tracking directive state and preventing
   * unnecessary DOM manipulations.
   */

  /**
   * Authentication Condition
   *
   * @property condition - boolean
   * - Stores the desired authentication state for content display
   * - true: Show content when user is authenticated
   * - false: Show content when user is NOT authenticated
   * - Set via the @Input setter method
   * - Used in combination with actual auth state to determine visibility
   *
   * Learning Notes:
   * - Private properties store internal directive state
   * - Boolean flags enable clear conditional logic
   * - Separation of input value from internal state improves maintainability
   */
  condition: boolean = false;

  /**
   * View State Tracking
   *
   * @property hasView - boolean
   * - Tracks whether the template is currently rendered in the DOM
   * - Prevents unnecessary DOM manipulations and view creation
   * - Optimizes performance by avoiding redundant operations
   * - Used to determine when to create or destroy embedded views
   *
   * Learning Notes:
   * - State tracking prevents unnecessary DOM operations
   * - Boolean flags provide clear state management
   * - Performance optimization through conditional view management
   * - Essential for managing dynamic content lifecycle
   */
  hasView = false;

  /**
   * Directive Initialization
   *
   * OnInit lifecycle hook that sets up the reactive subscription to
   * authentication state changes and handles initial rendering logic.
   *
   * Learning Notes:
   * - OnInit is ideal for initialization logic that depends on inputs
   * - Constructor should only handle dependency injection
   * - Reactive subscriptions should be set up in OnInit
   * - Proper subscription management prevents memory leaks
   */
  ngOnInit() {
    /**
     * Reactive Authentication State Subscription
     *
     * Sets up an observable subscription to monitor authentication state changes
     * and automatically update the DOM when auth state changes.
     */
    this.userService.isAuthenticated
      /**
       * Automatic Subscription Cleanup
       *
       * .pipe(takeUntilDestroyed(this.destroyRef))
       * - Modern Angular pattern for automatic subscription cleanup
       * - Automatically unsubscribes when directive is destroyed
       * - Prevents memory leaks without manual ngOnDestroy implementation
       * - Uses the injected DestroyRef for lifecycle management
       *
       * Learning Notes:
       * - takeUntilDestroyed replaces manual subscription management
       * - Eliminates need for OnDestroy interface implementation
       * - Follows reactive programming best practices
       * - Essential for preventing memory leaks in Angular applications
       */
      .pipe(takeUntilDestroyed(this.destroyRef))

      /**
       * Authentication State Handler
       *
       * Processes authentication state changes and updates DOM accordingly.
       *
       * @param isAuthenticated - Current authentication status from UserService
       */
      .subscribe((isAuthenticated: boolean) => {
        /**
         * Conditional Logic for Content Display
         *
         * Determines whether content should be shown based on:
         * 1. Current authentication state (isAuthenticated)
         * 2. Desired condition (this.condition)
         *
         * Logic Breakdown:
         * - authRequired: User is authenticated AND directive wants authenticated content
         * - unauthRequired: User is NOT authenticated AND directive wants unauthenticated content
         */

        /**
         * Show Content When User Is Authenticated
         *
         * @const authRequired
         * - true when: user is logged in AND directive condition is true
         * - Example: *ifAuthenticated="true" with logged-in user
         * - Used for content that should only appear for authenticated users
         */
        const authRequired = isAuthenticated && this.condition;

        /**
         * Show Content When User Is NOT Authenticated
         *
         * @const unauthRequired
         * - true when: user is NOT logged in AND directive condition is false
         * - Example: *ifAuthenticated="false" with logged-out user
         * - Used for content that should only appear for unauthenticated users
         */
        const unauthRequired = !isAuthenticated && !this.condition;

        /**
         * DOM Manipulation Logic
         *
         * Handles creating and destroying embedded views based on authentication
         * requirements and current view state.
         */

        /**
         * Create Embedded View (Show Content)
         *
         * Conditions: (authRequired OR unauthRequired) AND no view currently exists
         * - Creates and inserts the template content into the DOM
         * - Updates state to track that view now exists
         * - Prevents duplicate view creation
         */
        if ((authRequired || unauthRequired) && !this.hasView) {
          /**
           * ViewContainer.createEmbeddedView()
           * - Creates a new embedded view from the template
           * - Inserts the view into the DOM at this directive's location
           * - Returns ViewRef for further manipulation if needed
           * - Automatically integrates with Angular's change detection
           *
           * Learning Notes:
           * - createEmbeddedView handles template instantiation and DOM insertion
           * - Angular automatically manages change detection for embedded views
           * - View creation is relatively expensive, so state tracking is important
           * - Template context can be passed as second parameter if needed
           */
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (this.hasView) {

        /**
         * Remove Embedded View (Hide Content)
         *
         * Condition: view currently exists AND conditions no longer met
         * - Removes all views from the view container
         * - Updates state to track that no view exists
         * - Completely removes content from DOM
         */
          /**
           * ViewContainer.clear()
           * - Removes all embedded views from the container
           * - Completely removes content from DOM (not just hides it)
           * - More efficient than CSS visibility changes
           * - Automatically handles cleanup and memory management
           *
           * Learning Notes:
           * - clear() is more efficient than hiding with CSS
           * - Completely removes elements from DOM and memory
           * - Angular automatically handles view destruction lifecycle
           * - Better performance for frequently changing content
           */
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  /**
   * Input Property Setter
   *
   * @Input decorator with setter method for receiving the authentication condition
   * from the template. This enables the directive to react to input changes.
   *
   * Usage: *ifAuthenticated="true" or *ifAuthenticated="false"
   *
   * @param condition - Boolean indicating desired authentication state
   * - true: Show content when user is authenticated
   * - false: Show content when user is NOT authenticated
   *
   * Learning Notes:
   * - @Input with setter allows processing input values before assignment
   * - Setter pattern enables validation and transformation of input values
   * - Called whenever the input value changes in parent template
   * - Can trigger additional logic when input values change
   *
   * Advanced Usage:
   * - Could add validation: throw error for non-boolean values
   * - Could trigger immediate re-evaluation of display conditions
   * - Could emit events when condition changes
   * - Could integrate with OnChanges lifecycle for complex logic
   */
  @Input() set ifAuthenticated(condition: boolean) {
    this.condition = condition;
  }
}
