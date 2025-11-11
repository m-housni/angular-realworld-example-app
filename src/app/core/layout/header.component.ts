/**
 * Header Layout Component
 *
 * This component represents the application's main navigation header that appears
 * at the top of every page. It provides consistent navigation, user authentication
 * status, and branding across the entire application.
 *
 * Key Responsibilities:
 * - Display application branding/logo
 * - Show navigation links (Home, Sign In, Sign Up, etc.)
 * - Display user authentication state (logged in/out)
 * - Provide user-specific navigation when authenticated
 * - Highlight active navigation items
 *
 * Component Architecture:
 * - Standalone component using modern Angular patterns
 * - Uses dependency injection for accessing user service
 * - Leverages reactive programming with observables
 * - Conditional rendering based on authentication state
 *
 * Navigation Patterns:
 * - RouterLink: For programmatic navigation
 * - RouterLinkActive: For highlighting active routes
 * - Conditional menus: Different options for auth/unauth users
 */

// Import core Angular functionality
import { Component, inject } from "@angular/core";

// Import authentication service for user state management
import { UserService } from "../auth/services/user.service";

// Import Angular Router directives for navigation
import { RouterLink, RouterLinkActive } from "@angular/router";

// Import Angular common directives and pipes
import { AsyncPipe, NgIf } from "@angular/common";

// Import custom authentication directive
import { IfAuthenticatedDirective } from "../auth/if-authenticated.directive";

/**
 * Header Component Decorator Configuration
 *
 * Configures the component metadata for Angular's dependency injection
 * and rendering system.
 */
@Component({
  /**
   * Component Selector
   *
   * @selector "app-layout-header"
   * - Defines the HTML tag for this component: <app-layout-header></app-layout-header>
   * - Follows naming convention: app-[feature]-[component-name]
   * - "layout" indicates this is a layout/structural component
   * - Used in app.component.html to render the header
   *
   * Learning Notes:
   * - Descriptive selectors improve code readability
   * - Consistent naming conventions aid in component organization
   * - Layout components typically have "layout" in their selector
   */
  selector: "app-layout-header",

  /**
   * External Template File
   *
   * @templateUrl "./header.component.html"
   * - Points to the external HTML template containing the header structure
   * - Template likely contains navigation links, logo, user menu
   * - Separates presentation (HTML) from logic (TypeScript)
   *
   * Learning Notes:
   * - External templates are preferred for complex HTML structures
   * - Enables better IDE support and syntax highlighting
   * - Makes components more maintainable and testable
   */
  templateUrl: "./header.component.html",

  /**
   * Component Imports (Standalone Component Dependencies)
   *
   * Lists all Angular directives, pipes, and components needed by this component's template.
   * These imports replace the traditional NgModule declarations approach.
   */
  imports: [
    /**
     * RouterLinkActive Directive
     * - Automatically adds CSS classes to elements when their associated route is active
     * - Used to highlight the current page in navigation menus
     * - Example: <a routerLink="/home" routerLinkActive="active">Home</a>
     * - Helps users understand their current location in the app
     *
     * Learning Notes:
     * - Improves user experience through visual feedback
     * - Can apply multiple CSS classes: routerLinkActive="class1 class2"
     * - Works with both exact and partial route matching
     */
    RouterLinkActive,

    /**
     * RouterLink Directive
     * - Enables declarative navigation in templates
     * - Replaces traditional <a href=""> with Angular routing
     * - Example: <a routerLink="/login">Login</a>
     * - Prevents full page reloads, enabling SPA navigation
     *
     * Learning Notes:
     * - Supports both string and array syntax: routerLink="/path" or [routerLink]="['/path', param]"
     * - Automatically handles base href and route parameters
     * - Integrates with Angular's routing system for navigation guards, resolvers, etc.
     */
    RouterLink,

    /**
     * AsyncPipe
     * - Automatically subscribes to observables and unwraps their values
     * - Handles subscription management (subscribe/unsubscribe) automatically
     * - Example: {{ currentUser$ | async }}
     * - Prevents memory leaks by automatically unsubscribing
     *
     * Learning Notes:
     * - Essential for reactive programming patterns
     * - Automatically triggers change detection when observable emits
     * - Handles null/undefined values gracefully
     * - Best practice for displaying observable data in templates
     */
    AsyncPipe,

    /**
     * NgIf Directive
     * - Conditionally includes or removes elements from the DOM
     * - Used for showing/hiding navigation items based on authentication
     * - Example: <nav *ngIf="currentUser$ | async">...</nav>
     * - More efficient than CSS visibility (elements are completely removed)
     *
     * Learning Notes:
     * - Structural directive (uses * prefix)
     * - Completely adds/removes elements from DOM (not just hides them)
     * - Can be combined with else: *ngIf="condition; else template"
     * - Essential for conditional rendering based on application state
     */
    NgIf,

    /**
     * IfAuthenticatedDirective (Custom Directive)
     * - Custom structural directive for authentication-based rendering
     * - Likely shows/hides content based on user authentication status
     * - Example: <div *ifAuthenticated>User Menu</div>
     * - Encapsulates authentication logic for reuse across components
     *
     * Learning Notes:
     * - Custom directives provide reusable functionality
     * - Structural directives control DOM manipulation
     * - Authentication directives improve code organization
     * - Can be more expressive than generic NgIf for specific use cases
     */
    IfAuthenticatedDirective,
  ],

  /**
   * Standalone Component Flag
   *
   * @standalone true
   * - Enables this component to work without NgModule declarations
   * - Part of Angular's modern component architecture (v14+)
   * - Allows direct imports instead of module-based dependency management
   * - Improves tree-shaking and reduces bundle size
   */
  standalone: true,
})

/**
 * Header Component Class
 *
 * Contains the component's logic, properties, and methods.
 * This component is primarily concerned with displaying user authentication
 * state and providing reactive navigation based on that state.
 */
export class HeaderComponent {
  /**
   * Current User Observable
   *
   * @property currentUser$ - Observable stream of the current authenticated user
   *
   * Implementation Details:
   * - Uses Angular's inject() function for dependency injection (modern approach)
   * - Accesses the UserService to get current user state
   * - $ suffix indicates this is an observable (naming convention)
   * - Observable pattern enables reactive UI updates
   *
   * Usage in Template:
   * - Combined with AsyncPipe: {{ currentUser$ | async }}
   * - Used in structural directives: *ngIf="currentUser$ | async as user"
   * - Enables conditional rendering based on authentication state
   *
   * Learning Notes:
   *
   * Modern Dependency Injection:
   * - inject() function is the modern alternative to constructor injection
   * - More concise than constructor-based DI
   * - Can be used in component properties and functions
   * - Follows functional programming principles
   *
   * Reactive Programming Pattern:
   * - Observable streams provide automatic updates when user state changes
   * - No manual subscription management needed (AsyncPipe handles it)
   * - Enables real-time UI updates when login/logout occurs
   * - Follows reactive programming principles for better UX
   *
   * Authentication State Management:
   * - UserService maintains centralized user state
   * - Header component reacts to authentication changes
   * - Enables different navigation options for auth/unauth users
   * - Supports features like user profile links, logout buttons, etc.
   *
   * Alternative Approaches:
   * - Could use constructor injection: constructor(private userService: UserService)
   * - Could manually subscribe in ngOnInit (not recommended due to memory leaks)
   * - Could use signals (Angular 16+) for reactive state management
   */
  currentUser$ = inject(UserService).currentUser;
}
