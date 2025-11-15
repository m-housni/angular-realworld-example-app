/**
 * Application Routing Configuration
 *
 * This file defines the main routing configuration for the Angular application,
 * demonstrating modern Angular routing patterns including lazy loading,
 * route guards, and authentication-based navigation control.
 *
 * Key Concepts Demonstrated:
 * - Lazy Loading: Components loaded on-demand for better performance
 * - Route Guards: Authentication-based access control using canActivate
 * - Functional Guards: Modern guard implementation with functions instead of classes
 * - Dynamic Imports: Code splitting for optimal bundle sizes
 * - Nested Routes: Hierarchical route organization
 * - Route Parameters: Dynamic route segments for content identification
 *
 * Routing Architecture:
 * - Standalone routing without RouterModule (modern Angular approach)
 * - Authentication-aware navigation with reactive guards
 * - Feature-based route organization matching folder structure
 * - Lazy loading for improved initial load performance
 *
 * Authentication Flow:
 * - Public routes: Home, Article detail (accessible to all users)
 * - Guest-only routes: Login, Register (redirect authenticated users)
 * - Protected routes: Settings, Editor (require authentication)
 * - Mixed access: Profile (public viewing, private editing)
 *
 * Performance Optimization:
 * - Lazy loading reduces initial bundle size
 * - Code splitting enables progressive loading
 * - Feature modules loaded only when needed
 * - Dynamic imports optimize resource utilization
 *
 * Navigation Patterns:
 * - RESTful URL structure for better SEO and user experience
 * - Parameterized routes for dynamic content
 * - Nested routes for complex feature organization
 * - Authentication-aware routing for secure access
 */

import { Routes } from "@angular/router"; // Angular routing configuration interface
import { inject } from "@angular/core"; // Modern dependency injection for functional guards
import { UserService } from "./core/auth/services/user.service"; // Authentication service
import { map } from "rxjs/operators"; // RxJS operator for data transformation

/**
 * Application Routes Configuration
 *
 * Main routing table defining all application routes with their configurations,
 * guards, and lazy loading strategies. Each route represents a navigable
 * destination within the application.
 *
 * Route Structure:
 * - path: URL pattern for route matching
 * - loadComponent: Lazy-loaded component import
 * - loadChildren: Lazy-loaded child routes
 * - canActivate: Route guards for access control
 * - children: Nested route definitions
 *
 * Learning Notes:
 * - Routes array defines the complete navigation structure
 * - Order matters: more specific routes should come before generic ones
 * - Each route object configures a single navigation destination
 * - Modern Angular uses standalone routing without RouterModule
 */
export const routes: Routes = [
  /**
   * Home Route (Default/Root Route)
   *
   * Default landing page accessible to all users (authenticated and guest).
   * Displays article feed with public and user-specific content.
   *
   * Configuration:
   * - path: "": Matches empty path (domain.com/)
   * - loadComponent: Lazy loads home component on demand
   * - No guards: Accessible to all users
   * - Public route: Works for both guest and authenticated users
   *
   * Learning Notes:
   * - Empty path "" matches the root URL
   * - loadComponent enables lazy loading for performance
   * - Dynamic import returns a promise resolved by Angular
   * - Public routes don't need authentication guards
   *
   * User Experience:
   * - First page users see when visiting the application
   * - Shows different content based on authentication status
   * - Feed adapts to show global feed vs user's feed
   * - Quick access to latest articles and popular content
   */
  {
    path: "",
    loadComponent: () => import("./features/article/pages/home/home.component"),
  },

  /**
   * Login Route
   *
   * Authentication page for existing users to sign in.
   * Redirects already authenticated users away from login page.
   *
   * Configuration:
   * - path: "login": Matches domain.com/login
   * - loadComponent: Lazy loads auth component
   * - canActivate: Functional guard preventing authenticated user access
   * - Guest-only route: Authenticated users cannot access
   *
   * Authentication Guard Logic:
   * - inject(UserService).isAuthenticated: Gets authentication status observable
   * - .pipe(map((isAuth) => !isAuth)): Inverts auth status (allow if NOT authenticated)
   * - Returns true for guest users, false for authenticated users
   * - False result prevents route activation and can trigger redirects
   *
   * Learning Notes:
   * - Functional guards are modern alternative to class-based guards
   * - inject() function enables dependency injection in functional guards
   * - Observable-based guards enable reactive authentication checking
   * - Guard return values: true allows, false prevents route activation
   *
   * User Flow:
   * - Guest users: Can access login page and sign in
   * - Authenticated users: Prevented from accessing (no need to login again)
   * - After successful login: Typically redirected to home or intended page
   * - Failed login: Stay on page with error messages
   */
  {
    path: "login",
    loadComponent: () => import("./core/auth/auth.component"),
    canActivate: [
      () => inject(UserService).isAuthenticated.pipe(map((isAuth) => !isAuth)),
    ],
  },

  /**
   * Registration Route
   *
   * Sign-up page for new users to create accounts.
   * Uses same auth component as login but with different behavior.
   *
   * Configuration:
   * - path: "register": Matches domain.com/register
   * - loadComponent: Reuses auth component (adapts based on route)
   * - canActivate: Same guard as login (guest-only access)
   * - Shared component: Auth component detects route to show appropriate form
   *
   * Component Reuse Pattern:
   * - Single auth component handles both login and registration
   * - Component reads route to determine behavior
   * - Different forms, validation, and API calls based on route
   * - Reduces code duplication while maintaining distinct user flows
   *
   * Learning Notes:
   * - Route-aware components can adapt behavior based on current route
   * - Component reuse reduces bundle size and maintenance overhead
   * - Guards can be reused across routes with similar requirements
   * - RESTful URLs improve user understanding and SEO
   *
   * User Flow:
   * - New users: Can access registration page and sign up
   * - Authenticated users: Redirected away (already have account)
   * - After successful registration: Auto-login and redirect to home
   * - Validation errors: Stay on page with field-specific error messages
   */
  {
    path: "register",
    loadComponent: () => import("./core/auth/auth.component"),
    canActivate: [
      () => inject(UserService).isAuthenticated.pipe(map((isAuth) => !isAuth)),
    ],
  },

  /**
   * Settings Route (Protected)
   *
   * User account settings page accessible only to authenticated users.
   * Allows users to update profile information, password, and preferences.
   *
   * Configuration:
   * - path: "settings": Matches domain.com/settings
   * - loadComponent: Lazy loads settings component
   * - canActivate: Authentication required guard
   * - Protected route: Only authenticated users can access
   *
   * Authentication Guard Logic:
   * - inject(UserService).isAuthenticated: Returns authentication status observable
   * - Direct observable return (no transformation needed)
   * - True allows access, false prevents and can redirect to login
   * - Reactive guard updates when authentication status changes
   *
   * Learning Notes:
   * - Protected routes require authentication guards
   * - Observable guards enable real-time authentication checking
   * - Simple guards can return observables directly without transformation
   * - Guards prevent unauthorized access to sensitive functionality
   *
   * User Experience:
   * - Authenticated users: Can access and modify account settings
   * - Guest users: Redirected to login page (or show login prompt)
   * - Form validation: Prevents invalid data submission
   * - Success feedback: Confirmation of settings updates
   *
   * Security Considerations:
   * - Client-side guards improve UX but don't replace server-side security
   * - API endpoints should also validate user authentication
   * - Sensitive operations should require re-authentication
   * - Settings changes should be validated server-side
   */
  {
    path: "settings",
    loadComponent: () => import("./features/settings/settings.component"),
    canActivate: [() => inject(UserService).isAuthenticated],
  },

  /**
   * Profile Routes (Lazy-Loaded Feature Module)
   *
   * User profile section with multiple sub-routes for different profile views.
   * Demonstrates lazy loading of entire route modules for better code organization.
   *
   * Configuration:
   * - path: "profile": Base path for all profile-related routes
   * - loadChildren: Lazy loads entire profile routing module
   * - Feature module: Complete profile functionality in separate module
   * - Sub-routes: Defined in profile.routes.ts file
   *
   * Lazy Loading Benefits:
   * - Reduces initial bundle size by loading profile features on demand
   * - Code splitting enables progressive loading
   * - Feature isolation improves maintainability
   * - Faster initial application startup
   *
   * Learning Notes:
   * - loadChildren loads entire route modules vs single components
   * - Feature modules organize related functionality together
   * - Lazy loading improves performance for large applications
   * - Route modules can have their own guards, resolvers, and components
   *
   * Profile Sub-Routes (defined in profile.routes.ts):
   * - /profile/:username: Public profile view
   * - /profile/:username/favorites: User's favorited articles
   * - Additional profile-related routes as needed
   *
   * User Experience:
   * - Public profiles: Viewable by all users
   * - Private actions: Following, editing (require authentication)
   * - Profile navigation: Tabs or links for different profile sections
   * - SEO-friendly: Parameterized URLs for individual user profiles
   */
  {
    path: "profile",
    loadChildren: () => import("./features/profile/profile.routes"),
  },

  /**
   * Article Editor Routes (Nested Routes)
   *
   * Article creation and editing functionality with nested route structure.
   * Demonstrates parent-child route relationships and parameter-based routing.
   *
   * Configuration:
   * - path: "editor": Base path for editor functionality
   * - children: Array of nested child routes
   * - Protected routes: All editor routes require authentication
   * - Parameterized routes: Support for editing existing articles
   *
   * Nested Route Structure:
   * - Parent route defines common configuration
   * - Child routes inherit parent path and configuration
   * - Guards can be applied at parent or child level
   * - Component hierarchy matches route hierarchy
   *
   * Learning Notes:
   * - Nested routes enable hierarchical navigation structures
   * - Child routes inherit parent path: /editor + "" = /editor
   * - Guards can be inherited or overridden at child level
   * - Route parameters enable dynamic content editing
   */
  {
    path: "editor",
    children: [
      /**
       * New Article Route
       *
       * Article creation page for writing new articles.
       *
       * Configuration:
       * - path: "": Empty child path results in /editor URL
       * - loadComponent: Editor component for article creation
       * - canActivate: Authentication required
       * - New article mode: Component initializes with empty form
       *
       * Learning Notes:
       * - Empty child path creates route at parent path level
       * - Same component can handle both creation and editing
       * - Route detection determines component behavior
       * - Authentication required for content creation
       *
       * User Flow:
       * - User clicks "New Article" button
       * - Navigation to /editor
       * - Empty editor form for article creation
       * - Form validation before submission
       * - Redirect to article view after successful creation
       */
      {
        path: "",
        loadComponent: () =>
          import("./features/article/pages/editor/editor.component"),
        canActivate: [() => inject(UserService).isAuthenticated],
      },

      /**
       * Edit Existing Article Route
       *
       * Article editing page for modifying existing articles.
       * Uses route parameter to identify which article to edit.
       *
       * Configuration:
       * - path: ":slug": Route parameter for article identification
       * - loadComponent: Same editor component as creation
       * - canActivate: Authentication required
       * - Edit mode: Component loads existing article data
       *
       * Route Parameter Pattern:
       * - :slug: Dynamic segment matching article identifier
       * - Results in URLs like /editor/my-article-title
       * - Component accesses slug via ActivatedRoute service
       * - Slug used to fetch existing article data
       *
       * Learning Notes:
       * - Route parameters enable dynamic content identification
       * - Same component can handle different modes based on route
       * - Colon prefix (:) indicates route parameter
       * - Component logic determines behavior based on parameter presence
       *
       * User Flow:
       * - User clicks "Edit" button on existing article
       * - Navigation to /editor/article-slug
       * - Editor component loads existing article data
       * - Pre-populated form with current article content
       * - Update existing article on form submission
       *
       * Security Considerations:
       * - Backend should verify user owns article being edited
       * - Client-side checks complement server-side authorization
       * - Article access control based on authorship
       */
      {
        path: ":slug",
        loadComponent: () =>
          import("./features/article/pages/editor/editor.component"),
        canActivate: [() => inject(UserService).isAuthenticated],
      },
    ],
  },

  /**
   * Article Detail Route
   *
   * Individual article viewing page accessible to all users.
   * Uses route parameter to identify specific articles.
   *
   * Configuration:
   * - path: "article/:slug": Parameterized route for article identification
   * - loadComponent: Article detail component
   * - No guards: Public access for reading articles
   * - SEO-friendly: Clean URLs for individual articles
   *
   * Route Parameter Usage:
   * - :slug: Article identifier (URL-friendly version of title)
   * - Example: /article/understanding-angular-routing
   * - Component uses slug to fetch article data
   * - Slug serves as unique identifier for articles
   *
   * Learning Notes:
   * - Route parameters enable RESTful URL design
   * - Public routes don't require authentication guards
   * - Slug-based URLs improve SEO and shareability
   * - Component receives parameter via ActivatedRoute service
   *
   * User Experience:
   * - Public access: All users can read articles
   * - Direct linking: URLs can be shared and bookmarked
   * - SEO benefits: Search engines can index individual articles
   * - Comments: Display article comments and allow authenticated interaction
   *
   * Additional Features:
   * - Article content rendering with markdown support
   * - Author information and profile links
   * - Favorite button for authenticated users
   * - Comment system with authentication checks
   * - Related articles or recommendations
   *
   * Performance Considerations:
   * - Lazy loading reduces initial bundle size
   * - Article content loaded on demand
   * - Component caching for better navigation performance
   * - Image optimization for article media content
   */
  {
    path: "article/:slug",
    loadComponent: () =>
      import("./features/article/pages/article/article.component"),
  },
];
