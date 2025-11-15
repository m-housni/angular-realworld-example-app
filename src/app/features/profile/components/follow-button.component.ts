/**
 * Follow Button Component
 *
 * This component provides a reusable button for following/unfollowing user profiles.
 * It demonstrates similar patterns to the favorite button but for user relationships
 * instead of article interactions, showcasing consistent architectural patterns.
 *
 * Key Concepts Demonstrated:
 * - User Relationship Management: Following/unfollowing users
 * - Authentication Guards: Redirecting unauthenticated users to login
 * - Reactive Programming: Complex observable chains with authentication checking
 * - Conditional Operations: Different API calls based on current follow state
 * - Dynamic UI: Button text and styling changes based on follow status
 * - Component Communication: Input/Output patterns for profile data
 * - Loading States: User feedback during asynchronous operations
 *
 * Component Responsibilities:
 * - Display follow/unfollow button with appropriate styling and text
 * - Check authentication before allowing follow operations
 * - Toggle follow state via API calls (follow/unfollow)
 * - Provide visual feedback during API operations
 * - Emit updated profile data to parent components
 * - Redirect unauthenticated users to login page
 *
 * User Experience Flow:
 * 1. User sees button showing current follow state ("Follow" or "Unfollow")
 * 2. Button styling reflects follow status (outlined vs solid)
 * 3. User clicks to toggle follow status
 * 4. If not authenticated: redirect to login page
 * 5. If authenticated: API call to toggle follow state
 * 6. Button disabled during API call with visual feedback
 * 7. Parent component receives updated profile data
 * 8. UI updates to reflect new follow state
 *
 * Usage Pattern:
 * <app-follow-button
 *   [profile]="userProfile"
 *   (toggle)="handleFollowToggle($event)">
 * </app-follow-button>
 *
 * Comparison with FavoriteButtonComponent:
 * - Similar authentication and reactive programming patterns
 * - Different domain: user relationships vs article preferences
 * - Profile-based instead of article-based operations
 * - Login redirect vs registration redirect for different use cases
 */

import {
  Component, // Core Angular component decorator
  DestroyRef, // Modern lifecycle management for subscription cleanup
  EventEmitter, // Child-to-parent communication mechanism
  inject, // Modern dependency injection function
  Input, // Parent-to-child data flow decorator
  Output, // Child-to-parent event flow decorator
} from "@angular/core";
import { Router } from "@angular/router"; // Navigation service for authentication redirects
import { switchMap } from "rxjs/operators"; // RxJS operator for conditional observable switching
import { EMPTY } from "rxjs"; // RxJS constant for empty observable streams
import { ProfileService } from "../services/profile.service"; // Service for user profile operations
import { UserService } from "../../../core/auth/services/user.service"; // Authentication service
import { Profile } from "../models/profile.model"; // Type definition for profile data
import { NgClass } from "@angular/common"; // Angular directive for dynamic CSS classes
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"; // Modern subscription cleanup

/**
 * Component Decorator Configuration
 *
 * Configures the follow button component with inline template and necessary
 * dependencies for user relationship management functionality.
 */
@Component({
  /**
   * Component Selector
   *
   * @selector "app-follow-button"
   * - Defines HTML tag: <app-follow-button></app-follow-button>
   * - Follows naming convention: app-[feature]-[component]
   * - "follow-button" clearly identifies this as user following functionality
   * - Reusable across profile pages, user lists, and other contexts
   *
   * Learning Notes:
   * - Consistent naming with other button components (favorite-button)
   * - Generic naming enables reuse in multiple profile-related contexts
   * - Clear functional identification in component name
   * - Pattern consistency improves codebase maintainability
   */
  selector: "app-follow-button",

  /**
   * Inline Template Definition
   *
   * Self-contained template demonstrating dynamic button text, conditional styling,
   * and responsive user interface based on follow state and loading status.
   *
   * Template Features:
   * - Dynamic button text based on follow status
   * - Conditional CSS classes for visual state feedback
   * - Icon integration for visual consistency
   * - Loading state management during API operations
   * - Responsive styling with Bootstrap classes
   *
   * Learning Notes:
   * - Inline template suitable for focused, single-purpose components
   * - Dynamic text content provides clear user feedback
   * - Conditional styling enhances user experience
   * - Icon usage maintains visual consistency across the application
   */
  template: `
    <!-- 
      Dynamic Follow Button
      
      Bootstrap-styled button with state-dependent appearance and behavior.
      Demonstrates dynamic text content, conditional styling, and event handling
      for user relationship management.
      
      CSS Classes:
      - btn btn-sm: Bootstrap button with small size
      - action-btn: Custom class for action button styling
      - Dynamic classes via ngClass for state-based styling
      
      Event Handling:
      - (click): Triggers follow toggle with authentication checking
      - Handles both follow and unfollow operations
    -->
    <button
      class="btn btn-sm action-btn"
      [ngClass]="{
        disabled: isSubmitting,
        'btn-outline-secondary': !profile.following,
        'btn-secondary': profile.following
      }"
      (click)="toggleFollowing()"
    >
      <!-- 
        Plus Icon for Follow Action
        
        <i class="ion-plus-round"></i> - Ionic icon for "add" or "follow"
        - Visual indicator for follow action
        - Consistent with "add to network" or "connect" metaphors
        - Static icon while text content changes dynamically
        
        Learning Notes:
        - Plus icon universally represents "add" or "connect" actions
        - Icons provide visual context for user actions
        - Consistent iconography improves user experience
        - Consider different icons for follow vs unfollow states
      -->
      <i class="ion-plus-round"></i>

      <!-- 
        Visual Spacing
        
        &nbsp; - Non-breaking space between icon and text
        - Ensures consistent spacing in different contexts
        - Prevents layout issues with dynamic text content
        - Simple spacing solution for icon-text combinations
        
        Learning Notes:
        - Non-breaking spaces prevent awkward line breaks
        - Consistent spacing improves visual design
        - HTML entities provide special characters
        - CSS spacing often preferred for larger layouts
      -->
      &nbsp;

      <!-- 
        Dynamic Button Text
        
        {{ profile.following ? "Unfollow" : "Follow" }} {{ profile.username }}
        - Conditional text based on current follow status
        - Includes target username for clear user context
        - Updates automatically when follow state changes
        - Provides clear action indication to users
        
        Learning Notes:
        - Ternary operators enable concise conditional content
        - Dynamic text improves user understanding of available actions
        - Including username provides context for the action
        - Interpolation automatically updates when data changes
        
        Text Examples:
        - Not following: "Follow john_doe"
        - Following: "Unfollow john_doe"
        - Clear action indication with target identification
      -->
      {{ profile.following ? "Unfollow" : "Follow" }} {{ profile.username }}
    </button>
  `,

  /**
   * Component Imports (Standalone Dependencies)
   *
   * Minimal imports focused on dynamic styling functionality.
   * Demonstrates lean dependency management for focused components.
   */
  imports: [
    /**
     * NgClass - Dynamic CSS class directive
     * - Conditionally applies CSS classes based on component state
     * - Object syntax: { className: condition } for multiple classes
     * - Enables responsive styling based on follow state and loading status
     * - Essential for providing visual feedback during state changes
     *
     * Usage in Template:
     * [ngClass]="{
     *   disabled: isSubmitting,           // Disable button during API calls
     *   'btn-outline-secondary': !following, // Outline style when not following
     *   'btn-secondary': following        // Solid style when following
     * }"
     *
     * Learning Notes:
     * - Object syntax allows multiple conditional classes
     * - Class names as strings when they contain hyphens
     * - Boolean expressions determine class application
     * - Combines with static classes for complete styling
     */
    NgClass,
  ],

  /**
   * Standalone Component Flag
   *
   * @standalone true
   * - Modern Angular component architecture (v14+)
   * - No NgModule declarations required
   * - Direct dependency management within component
   * - Improved tree-shaking and bundle optimization
   */
  standalone: true,
})

/**
 * Follow Button Component Class
 *
 * Implements user relationship management with authentication checking,
 * API integration, and reactive programming patterns similar to article
 * favoriting but focused on user-to-user relationships.
 *
 * Learning Notes:
 * - Similar architectural patterns to FavoriteButtonComponent
 * - Domain-specific logic for user relationships
 * - Consistent reactive programming approach
 * - Authentication integration with appropriate redirects
 */
export class FollowButtonComponent {
  /**
   * Profile Data Input Property
   *
   * @Input() profile!: Profile
   * - Receives profile data from parent component
   * - Required input indicated by non-null assertion operator (!)
   * - Strongly typed with Profile interface for type safety
   * - Contains follow state and user information needed for operations
   *
   * Learning Notes:
   * - @Input enables parent-to-child data flow
   * - Non-null assertion (!) indicates required input
   * - Type safety through interface typing prevents runtime errors
   * - Profile model includes following status and username for operations
   *
   * Profile Properties Used:
   * - profile.following: Current follow status (boolean)
   * - profile.username: User identifier for API operations and display
   * - profile.bio, profile.image: Additional profile information
   *
   * Usage in Parent:
   * <app-follow-button [profile]="userProfile"></app-follow-button>
   */
  @Input() profile!: Profile;

  /**
   * Profile Update Event Emitter
   *
   * @Output() toggle = new EventEmitter<Profile>()
   * - Emits updated profile data when follow state changes
   * - EventEmitter<Profile> provides type safety for emitted values
   * - Parent component receives complete updated profile data
   * - Enables parent to update profile displays and related data
   *
   * Learning Notes:
   * - @Output enables child-to-parent communication
   * - EventEmitter with Profile type ensures complete data transmission
   * - Parent receives full updated profile instead of just boolean state
   * - Enables comprehensive UI updates based on API response
   *
   * Usage in Parent:
   * <app-follow-button
   *   [profile]="profile"
   *   (toggle)="updateUserProfile($event)">
   * </app-follow-button>
   *
   * Event Flow:
   * 1. User clicks follow/unfollow button
   * 2. API call succeeds with updated profile data
   * 3. Component emits complete updated profile
   * 4. Parent receives profile and updates displays
   * 5. UI reflects new follow state and follower counts
   *
   * Comparison with FavoriteButtonComponent:
   * - Emits Profile object vs boolean value
   * - Provides more comprehensive update data
   * - Enables updating follower counts and other profile information
   */
  @Output() toggle = new EventEmitter<Profile>();

  /**
   * Loading State Management
   *
   * @property isSubmitting - boolean
   * - Tracks whether follow operation is in progress
   * - Used to disable button during API calls
   * - Provides visual feedback to prevent multiple submissions
   * - Reset when operation completes (success or error)
   *
   * Learning Notes:
   * - Loading states essential for good UX during async operations
   * - Prevents race conditions from rapid clicking
   * - Visual feedback shows system is processing user action
   * - Should be reset in both success and error scenarios
   */
  isSubmitting = false;

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
   * Constructor - Traditional Dependency Injection
   *
   * Injects services required for user relationship management including
   * profile operations, navigation, and authentication checking.
   *
   * @param profileService - Service for user profile API operations
   * @param router - Router for navigation to login page
   * @param userService - Service for authentication state checking
   */
  constructor(
    /**
     * Profile Service
     *
     * @param profileService - ProfileService
     * - Provides methods for follow/unfollow API operations
     * - Handles HTTP requests to user relationship endpoints
     * - Returns observables for reactive programming patterns
     * - Centralized profile-related API logic
     *
     * Learning Notes:
     * - Service injection enables separation of concerns
     * - Profile API logic centralized in service layer
     * - Observable return types enable reactive programming
     * - Reusable across different profile-related components
     */
    private readonly profileService: ProfileService,

    /**
     * Router Service
     *
     * @param router - Router
     * - Enables programmatic navigation for unauthenticated users
     * - Redirects to login page when follow requires authentication
     * - Different from favorite button which redirects to registration
     * - Context-appropriate authentication flow
     *
     * Learning Notes:
     * - Router enables programmatic navigation based on conditions
     * - Authentication flows should match user context
     * - Login vs registration redirects depend on feature context
     * - Following implies existing user, login more appropriate than signup
     */
    private readonly router: Router,

    /**
     * User Service
     *
     * @param userService - UserService
     * - Provides authentication state checking
     * - Offers reactive streams for authentication status
     * - Centralized user authentication logic
     * - Used to determine if follow operation is allowed
     *
     * Learning Notes:
     * - Shared authentication service across components
     * - Reactive authentication state enables real-time updates
     * - Centralized auth logic prevents inconsistencies
     * - Observable patterns enable authentication-dependent operations
     */
    private readonly userService: UserService,
  ) {}

  /**
   * Toggle Following Functionality
   *
   * Complex method implementing authentication checking, conditional API calls,
   * and reactive programming patterns for user relationship management.
   * Similar to favorite toggle but for user-to-user relationships.
   *
   * Method Flow:
   * 1. Set loading state for immediate UI feedback
   * 2. Check user authentication status
   * 3. If unauthenticated: redirect to login page
   * 4. If authenticated: call appropriate API method (follow/unfollow)
   * 5. Handle success: emit updated profile data and reset loading state
   * 6. Handle error: reset loading state for retry capability
   *
   * Learning Notes:
   * - Similar reactive programming patterns to favorite button
   * - Domain-specific logic for user relationships
   * - Authentication guards implemented at component level
   * - Comprehensive error handling and state management
   */
  toggleFollowing(): void {
    /**
     * Loading State Initialization
     *
     * Sets loading state immediately for responsive user feedback
     * and prevents multiple simultaneous API calls.
     *
     * Learning Notes:
     * - Immediate loading state provides responsive UI
     * - Prevents race conditions from rapid user interactions
     * - Visual feedback improves perceived performance
     * - Essential for operations with network latency
     */
    this.isSubmitting = true;

    /**
     * Reactive Authentication and API Call Chain
     *
     * Complex observable chain implementing:
     * 1. Authentication status checking
     * 2. Unauthenticated user redirect handling
     * 3. Conditional API calls based on current follow state
     * 4. Automatic subscription cleanup
     *
     * RxJS Operators Used:
     * - pipe(): Chains multiple operators for data transformation
     * - switchMap(): Switches to new observable based on authentication
     * - takeUntilDestroyed(): Automatic subscription cleanup
     *
     * Learning Notes:
     * - Similar pattern to favorite button demonstrates consistency
     * - Reactive programming enables complex authentication flows
     * - Conditional API operations based on current state
     * - Modern subscription management prevents memory leaks
     */
    this.userService.isAuthenticated
      .pipe(
        /**
         * Authentication Check and Conditional API Call
         *
         * switchMap((isAuthenticated: boolean) => { ... })
         * - Switches observable stream based on authentication status
         * - Returns different observables for authenticated vs unauthenticated
         * - Cancels previous operations when authentication state changes
         * - Essential for authentication-dependent user actions
         *
         * Learning Notes:
         * - switchMap perfect for authentication-dependent operations
         * - Cancellation prevents outdated operations
         * - Type annotation improves code readability
         * - Consistent pattern with other authentication-dependent components
         */
        switchMap((isAuthenticated: boolean) => {
          /**
           * Unauthenticated User Handling
           *
           * Redirects users to login page if not authenticated
           * and returns EMPTY observable to terminate the chain.
           *
           * Navigation Logic:
           * - void this.router.navigate(["/login"]): Programmatic navigation to login
           * - Different from favorite button which redirects to registration
           * - return EMPTY: Terminates observable chain without API calls
           *
           * Learning Notes:
           * - Context-appropriate authentication redirects
           * - Following implies user wants to engage, login more appropriate
           * - EMPTY observable cleanly terminates reactive chains
           * - void operator shows intentional disregard of navigation return
           *
           * Design Decision:
           * - Login vs Registration: Following suggests user engagement,
           *   login more likely than new user registration
           * - Consistent with social media platform patterns
           * - User experience consideration for feature context
           */
          if (!isAuthenticated) {
            void this.router.navigate(["/login"]);
            return EMPTY;
          }

          /**
           * Conditional API Call Based on Current Follow State
           *
           * Determines whether to follow or unfollow based on current state
           * and returns appropriate service method observable.
           *
           * Conditional Logic:
           * - !this.profile.following: User is not currently following target
           * - profileService.follow(): Add target to user's following list
           * - profileService.unfollow(): Remove target from user's following list
           * - Both methods return observables with updated profile data
           *
           * Learning Notes:
           * - Toggle functionality requires checking current state
           * - Different API endpoints for follow vs unfollow operations
           * - Service methods return updated profile data
           * - Consistent pattern with favorite button toggle logic
           */
          if (!this.profile.following) {
            return this.profileService.follow(this.profile.username);
          } else {
            return this.profileService.unfollow(this.profile.username);
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
         * - Essential for preventing memory leaks
         * - Modern alternative to OnDestroy interface
         * - Reactive lifecycle management
         * - Consistent pattern across all observable subscriptions
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
         * Called when follow/unfollow operation completes successfully.
         * Updates component state and provides updated profile data to parent.
         *
         * @param profile - Updated profile data from API response
         *
         * Success Actions:
         * 1. Reset loading state to re-enable button
         * 2. Emit complete updated profile data to parent
         * 3. Enable parent to update displays and related data
         *
         * Learning Notes:
         * - Success handler receives updated profile data from API
         * - Loading state reset enables further user interactions
         * - Complete profile data enables comprehensive UI updates
         * - Parent component can update follower counts, follow status, etc.
         *
         * Comparison with Favorite Button:
         * - Emits complete profile vs boolean toggle value
         * - Enables more comprehensive parent updates
         * - Profile data includes follower counts and other metadata
         */
        next: (profile) => {
          this.isSubmitting = false;
          this.toggle.emit(profile);
        },

        /**
         * Error Handler
         *
         * Called when follow/unfollow operation fails.
         * Resets loading state to allow user retry.
         *
         * Error Handling:
         * - Resets loading state to re-enable button
         * - Allows user to retry the operation
         * - Could be enhanced with error messaging
         * - Graceful degradation maintains usable interface
         *
         * Learning Notes:
         * - Error handling should always reset loading states
         * - Users should be able to retry after errors
         * - Graceful degradation maintains functionality
         * - Could be enhanced with user-friendly error messages
         *
         * Potential Enhancements:
         * - Display specific error messages to users
         * - Different handling for network vs server errors
         * - Retry logic for transient failures
         * - Optimistic UI updates with rollback on error
         */
        error: () => (this.isSubmitting = false),
      });
  }
}
