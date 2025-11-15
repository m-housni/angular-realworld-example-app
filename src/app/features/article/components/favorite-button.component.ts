/**
 * Favorite Button Component
 *
 * This component provides a reusable button for favoriting/unfavoriting articles.
 * It demonstrates complex reactive programming patterns, authentication handling,
 * and sophisticated user interaction management in Angular applications.
 *
 * Key Concepts Demonstrated:
 * - Authentication Guards: Redirecting unauthenticated users
 * - Reactive Programming: Complex observable chains with switchMap
 * - Conditional API Calls: Different operations based on current state
 * - Loading States: UI feedback during asynchronous operations
 * - Error Handling: Graceful degradation on operation failures
 * - Component Communication: Input/Output patterns for reusable components
 * - Dynamic Styling: Conditional CSS classes based on state
 *
 * Component Responsibilities:
 * - Display favorite button with appropriate styling and content
 * - Handle authentication checking before allowing favorite operations
 * - Toggle favorite state via API calls (favorite/unfavorite)
 * - Provide loading feedback during API operations
 * - Emit events to parent components for state synchronization
 * - Redirect unauthenticated users to registration page
 *
 * User Experience Flow:
 * 1. User sees button with heart icon and custom content
 * 2. Button appearance reflects current favorite state
 * 3. User clicks button to toggle favorite status
 * 4. If not authenticated: redirect to registration
 * 5. If authenticated: API call to toggle favorite state
 * 6. Button disabled during API call with visual feedback
 * 7. Parent component updated on successful state change
 * 8. Error handling resets button state if operation fails
 *
 * Reusability Pattern:
 * <app-favorite-button
 *   [article]="articleData"
 *   (toggle)="handleFavoriteToggle($event)">
 *   {{ article.favoritesCount }} favorites
 * </app-favorite-button>
 */

import {
  Component, // Core Angular component decorator
  DestroyRef, // Modern lifecycle management for subscription cleanup
  EventEmitter, // Child-to-parent communication mechanism
  inject, // Modern dependency injection function
  Input, // Parent-to-child data flow decorator
  Output, // Child-to-parent event flow decorator
} from "@angular/core";
import { Router } from "@angular/router"; // Navigation service for redirects
import { EMPTY, switchMap } from "rxjs"; // RxJS operators for reactive programming
import { NgClass } from "@angular/common"; // Angular directive for dynamic CSS classes
import { ArticlesService } from "../services/articles.service"; // Service for article operations
import { UserService } from "../../../core/auth/services/user.service"; // Authentication service
import { Article } from "../models/article.model"; // Type definition for article data
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"; // Modern subscription cleanup

/**
 * Component Decorator Configuration
 *
 * Configures the component with inline template and necessary dependencies
 * for a self-contained, reusable favorite button component.
 */
@Component({
  /**
   * Component Selector
   *
   * @selector "app-favorite-button"
   * - Defines HTML tag: <app-favorite-button></app-favorite-button>
   * - Follows naming convention: app-[feature]-[component]
   * - "favorite-button" clearly identifies this as article favoriting component
   * - Reusable across different contexts (article lists, detail pages, etc.)
   *
   * Learning Notes:
   * - Generic naming enables reuse in multiple contexts
   * - Button components often have "button" suffix for clarity
   * - Feature-specific functionality clearly identified in name
   */
  selector: "app-favorite-button",

  /**
   * Inline Template Definition
   *
   * Self-contained template demonstrating dynamic styling, event handling,
   * and content projection for flexible button customization.
   *
   * Template Features:
   * - Dynamic CSS classes based on component state
   * - Event handling for user interactions
   * - Content projection for customizable button text
   * - Icon integration for visual feedback
   * - Loading state management with disabled state
   *
   * Learning Notes:
   * - Inline templates work well for small, focused components
   * - Dynamic styling provides rich user feedback
   * - Content projection enables flexible component reuse
   * - Event binding connects user actions to component methods
   */
  template: `
    <!-- 
      Dynamic Favorite Button
      
      Bootstrap button with dynamic styling and behavior based on:
      - Article favorite status (favorited vs unfavorited)
      - Loading state during API operations
      - User interaction handling
      
      CSS Classes:
      - btn btn-sm: Bootstrap button with small size
      - Dynamic classes via ngClass directive for state-based styling
      
      Event Handling:
      - (click): Triggers favorite toggle functionality
      - Includes authentication checking and API calls
    -->
    <button
      class="btn btn-sm"
      [ngClass]="{
        disabled: isSubmitting,
        'btn-outline-primary': !article.favorited,
        'btn-primary': article.favorited
      }"
      (click)="toggleFavorite()"
    >
      <!-- 
        Heart Icon
        
        <i class="ion-heart"></i> - Ionic icon for favorite indication
        - Universal symbol for "like" or "favorite" functionality
        - Consistent visual language across the application
        - Icon remains static while styling changes based on state
        
        Learning Notes:
        - Iconic UI elements improve user recognition and understanding
        - Consistent iconography enhances user experience
        - Visual symbols transcend language barriers
      -->
      <i class="ion-heart"></i>

      <!-- 
        Content Projection
        
        <ng-content></ng-content> - Angular content projection
        - Allows parent components to provide custom content
        - Enables flexible button text (e.g., "5 favorites", "Add to favorites")
        - Makes component reusable in different contexts
        - Maintains button structure while allowing content customization
        
        Learning Notes:
        - Content projection enables component reusability
        - ng-content acts as a slot for parent-provided content
        - Allows components to be flexible without losing structure
        - Common pattern for UI library components
        
        Usage Examples:
        <app-favorite-button [article]="article">
          {{ article.favoritesCount }} favorites
        </app-favorite-button>
        
        <app-favorite-button [article]="article">
          Add to favorites
        </app-favorite-button>
      -->
      <ng-content></ng-content>
    </button>
  `,

  /**
   * Component Imports (Standalone Dependencies)
   *
   * All Angular directives needed by the component template.
   * Minimal imports for focused functionality.
   */
  imports: [
    /**
     * NgClass - Dynamic CSS class directive
     * - Conditionally applies CSS classes based on component state
     * - Object syntax: { className: condition } for multiple classes
     * - Enables responsive UI feedback based on data and state
     * - Essential for dynamic styling in Angular applications
     *
     * Usage in Template:
     * [ngClass]="{
     *   disabled: isSubmitting,           // Disable button during API calls
     *   'btn-outline-primary': !favorited, // Outline style when not favorited
     *   'btn-primary': favorited          // Solid style when favorited
     * }"
     */
    NgClass,
  ],

  /**
   * Standalone Component Flag
   *
   * @standalone true
   * - Modern Angular component architecture (v14+)
   * - No NgModule declarations required
   * - Direct dependency imports in component
   * - Better tree-shaking and performance optimization
   */
  standalone: true,
})

/**
 * Favorite Button Component Class
 *
 * Implements the core logic for article favoriting with authentication
 * handling, API integration, and sophisticated reactive programming patterns.
 *
 * Learning Notes:
 * - Complex component demonstrating multiple Angular concepts
 * - Reactive programming with RxJS for asynchronous operations
 * - Authentication integration with redirect handling
 * - Error handling and loading state management
 */
export class FavoriteButtonComponent {
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
   * - Essential for components with observable subscriptions
   */
  destroyRef = inject(DestroyRef);

  /**
   * Loading State Management
   *
   * @property isSubmitting - boolean
   * - Tracks whether favorite operation is in progress
   * - Used to disable button during API calls
   * - Provides visual feedback to prevent double-clicking
   * - Reset when operation completes (success or error)
   *
   * Learning Notes:
   * - Loading states essential for good UX during async operations
   * - Prevents users from triggering multiple simultaneous requests
   * - Visual feedback shows system is processing user action
   * - Should be reset in both success and error scenarios
   */
  isSubmitting = false;

  /**
   * Article Data Input Property
   *
   * @Input() article!: Article
   * - Receives article data from parent component
   * - Required input indicated by non-null assertion operator (!)
   * - Strongly typed with Article interface for type safety
   * - Contains favorite state and article metadata needed for operations
   *
   * Learning Notes:
   * - @Input enables parent-to-child data flow
   * - Non-null assertion (!) indicates required input
   * - Type safety through interface typing prevents runtime errors
   * - Article model includes favorited status and slug for API calls
   *
   * Article Properties Used:
   * - article.favorited: Current favorite status (boolean)
   * - article.slug: Unique identifier for API operations
   * - article.favoritesCount: Total number of favorites (for display)
   */
  @Input() article!: Article;

  /**
   * Toggle Event Emitter
   *
   * @Output() toggle = new EventEmitter<boolean>()
   * - Emits events to parent when favorite state changes
   * - EventEmitter<boolean> provides type safety for emitted values
   * - Parent component listens: (toggle)="handleToggle($event)"
   * - Enables parent to update article lists and state
   *
   * Learning Notes:
   * - @Output enables child-to-parent communication
   * - EventEmitter is Angular's mechanism for custom events
   * - Generic typing <boolean> ensures type safety for emitted values
   * - Parent components update their data based on emitted events
   *
   * Usage in Parent:
   * <app-favorite-button
   *   [article]="article"
   *   (toggle)="updateArticleFavoriteStatus($event)">
   * </app-favorite-button>
   *
   * Event Flow:
   * 1. User clicks favorite button
   * 2. API call succeeds/fails
   * 3. Component emits new favorite status
   * 4. Parent receives event and updates article data
   * 5. UI reflects updated favorite state
   */
  @Output() toggle = new EventEmitter<boolean>();

  /**
   * Constructor - Traditional Dependency Injection
   *
   * Injects services required for favorite functionality including
   * article operations, navigation, and authentication checking.
   *
   * @param articleService - Service for article API operations
   * @param router - Router for navigation to registration
   * @param userService - Service for authentication state checking
   */
  constructor(
    /**
     * Articles Service
     *
     * @param articleService - ArticlesService
     * - Provides methods for favorite/unfavorite API operations
     * - Handles HTTP requests to backend article endpoints
     * - Returns observables for reactive programming patterns
     * - Centralized article-related API logic
     *
     * Learning Notes:
     * - Service injection enables separation of concerns
     * - API logic centralized in service layer
     * - Observable return types enable reactive programming
     * - Reusable across different article-related components
     */
    private readonly articleService: ArticlesService,

    /**
     * Router Service
     *
     * @param router - Router
     * - Enables programmatic navigation for unauthenticated users
     * - Redirects to registration page when favorite requires authentication
     * - Provides navigation methods for user flow management
     * - Essential for authentication-guarded features
     *
     * Learning Notes:
     * - Router enables programmatic navigation based on conditions
     * - Authentication flows often require navigation
     * - User experience improved by automatic redirects
     * - Navigation should be contextual to user actions
     */
    private readonly router: Router,

    /**
     * User Service
     *
     * @param userService - UserService
     * - Provides authentication state checking
     * - Offers reactive streams for authentication status
     * - Centralized user authentication logic
     * - Used to determine if favorite operation is allowed
     *
     * Learning Notes:
     * - Authentication service provides reactive auth state
     * - Components can react to authentication changes
     * - Centralized auth logic prevents inconsistencies
     * - Observable patterns enable real-time auth status updates
     */
    private readonly userService: UserService,
  ) {}

  /**
   * Toggle Favorite Functionality
   *
   * Complex method demonstrating authentication checking, conditional API calls,
   * and sophisticated reactive programming patterns with RxJS operators.
   *
   * Method Flow:
   * 1. Set loading state to prevent double-clicking
   * 2. Check user authentication status
   * 3. If unauthenticated: redirect to registration
   * 4. If authenticated: call appropriate API method (favorite/unfavorite)
   * 5. Handle success: emit event and reset loading state
   * 6. Handle error: reset loading state for retry
   *
   * Learning Notes:
   * - Complex reactive programming with multiple RxJS operators
   * - Authentication guards implemented at component level
   * - Conditional API calls based on current state
   * - Comprehensive error handling and loading state management
   */
  toggleFavorite(): void {
    /**
     * Loading State Initialization
     *
     * Sets loading state to provide immediate user feedback
     * and prevent multiple simultaneous API calls.
     *
     * Learning Notes:
     * - Loading state set immediately for responsive UI
     * - Prevents race conditions from rapid clicking
     * - Visual feedback improves perceived performance
     */
    this.isSubmitting = true;

    /**
     * Reactive Authentication and API Call Chain
     *
     * Complex observable chain that:
     * 1. Checks authentication status
     * 2. Handles unauthenticated users with navigation
     * 3. Performs conditional API calls based on current favorite state
     * 4. Manages subscription cleanup automatically
     *
     * RxJS Operators Used:
     * - pipe(): Chains multiple operators for data transformation
     * - switchMap(): Switches to new observable based on authentication
     * - takeUntilDestroyed(): Automatic subscription cleanup
     *
     * Learning Notes:
     * - Complex reactive programming demonstrates RxJS power
     * - Authentication checking integrated into user action flow
     * - Conditional logic determines appropriate API operation
     * - Modern subscription management prevents memory leaks
     */
    this.userService.isAuthenticated
      .pipe(
        /**
         * Authentication Check and Conditional API Call
         *
         * switchMap((authenticated) => { ... })
         * - Switches observable stream based on authentication status
         * - Returns different observables for authenticated vs unauthenticated users
         * - Cancels previous operations when new authentication state arrives
         * - Essential for authentication-dependent operations
         *
         * Learning Notes:
         * - switchMap cancels previous inner observables when new values arrive
         * - Perfect for authentication checks that might change during operation
         * - Enables conditional observable chains based on user state
         * - More powerful than simple if/else for reactive programming
         */
        switchMap((authenticated) => {
          /**
           * Unauthenticated User Handling
           *
           * Redirects users to registration page if they're not logged in
           * and returns EMPTY observable to terminate the chain.
           *
           * Navigation Logic:
           * - void this.router.navigate(["/register"]): Programmatic navigation
           * - return EMPTY: RxJS constant that immediately completes
           * - Terminates observable chain without proceeding to API calls
           *
           * Learning Notes:
           * - Authentication guards can be implemented at component level
           * - void operator shows intentional disregard of navigation return value
           * - EMPTY observable is useful for conditional chain termination
           * - User experience: automatic redirect instead of error messages
           */
          if (!authenticated) {
            void this.router.navigate(["/register"]);
            return EMPTY;
          }

          /**
           * Conditional API Call Based on Current Favorite State
           *
           * Determines whether to favorite or unfavorite based on current state
           * and returns appropriate service method observable.
           *
           * Conditional Logic:
           * - !this.article.favorited: Article is not currently favorited
           * - articleService.favorite(): Add article to user's favorites
           * - articleService.unfavorite(): Remove article from user's favorites
           * - Both methods return observables for reactive programming
           *
           * Learning Notes:
           * - Toggle functionality requires checking current state
           * - Different API endpoints for add vs remove operations
           * - Service methods return observables for consistent reactive patterns
           * - Conditional API calls based on component state
           */
          if (!this.article.favorited) {
            return this.articleService.favorite(this.article.slug);
          } else {
            return this.articleService.unfavorite(this.article.slug);
          }
        }),

        /**
         * Automatic Subscription Cleanup
         *
         * takeUntilDestroyed(this.destroyRef)
         * - Automatically unsubscribes when component is destroyed
         * - Prevents memory leaks from active subscriptions
         * - Modern Angular pattern replacing manual OnDestroy
         * - Uses injected DestroyRef for lifecycle management
         *
         * Learning Notes:
         * - Essential for preventing memory leaks in Angular applications
         * - Modern alternative to implementing OnDestroy interface
         * - Reactive lifecycle management with dependency injection
         * - Should be used with all component-level subscriptions
         */
        takeUntilDestroyed(this.destroyRef),
      )

      /**
       * Success and Error Handling
       *
       * Subscription with separate handlers for successful operations
       * and error scenarios, ensuring proper state management.
       */
      .subscribe({
        /**
         * Success Handler
         *
         * Called when favorite/unfavorite operation completes successfully.
         * Updates component state and notifies parent component.
         *
         * Success Actions:
         * 1. Reset loading state to re-enable button
         * 2. Emit toggle event with new favorite status
         * 3. Allow parent component to update article data
         *
         * Learning Notes:
         * - Success handling includes both UI and data updates
         * - Loading state reset enables further user interactions
         * - Event emission maintains parent-child data synchronization
         * - Toggle value represents NEW favorite status after operation
         */
        next: () => {
          this.isSubmitting = false;
          this.toggle.emit(!this.article.favorited);
        },

        /**
         * Error Handler
         *
         * Called when favorite/unfavorite operation fails.
         * Resets loading state to allow user retry.
         *
         * Error Handling:
         * - Resets loading state to re-enable button
         * - Allows user to retry the operation
         * - Could be enhanced with error messaging
         * - Graceful degradation without breaking user experience
         *
         * Learning Notes:
         * - Error handling should always reset loading states
         * - Graceful degradation maintains usable interface
         * - User should be able to retry after errors
         * - Could be enhanced with user-friendly error messages
         *
         * Potential Enhancements:
         * - Display error messages to user
         * - Different handling for network vs server errors
         * - Retry logic for transient failures
         * - Optimistic UI updates with rollback on error
         */
        error: () => (this.isSubmitting = false),
      });
  }
}
