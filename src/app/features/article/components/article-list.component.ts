/**
 * Article List Display Component
 *
 * Reusable component that displays a paginated list of articles with loading states,
 * empty states, and interactive pagination. This component serves as the foundation
 * for article feeds, user profiles, and tag-filtered article listings.
 *
 * Key Concepts Demonstrated:
 * - Component Reusability: Configurable component for different article contexts
 * - Input Property Patterns: Using setters for reactive configuration changes
 * - Pagination Logic: Client-side pagination with server-side data fetching
 * - Loading State Management: Visual feedback during async operations
 * - Modern Angular Template Syntax: @if, @for, @empty control flow
 * - Memory Leak Prevention: Automatic subscription cleanup with takeUntilDestroyed
 * - Component Communication: Parent-child data flow with inputs and outputs
 *
 * Component Responsibilities:
 * - Display paginated article lists with consistent styling
 * - Handle loading and empty states with user-friendly messages
 * - Provide pagination controls for navigating large article sets
 * - Manage API queries with proper error handling and cleanup
 * - Respond to configuration changes from parent components
 *
 * Usage Patterns:
 *
 * Global Feed (Home Page):
 * ```html
 * <app-article-list [config]="globalFeedConfig" [limit]="10"></app-article-list>
 * ```
 *
 * User Feed (Authenticated Users):
 * ```html
 * <app-article-list [config]="userFeedConfig" [limit]="10"></app-article-list>
 * ```
 *
 * Profile Articles:
 * ```html
 * <app-article-list [config]="profileConfig" [limit]="5"></app-article-list>
 * ```
 *
 * Tag Filtering:
 * ```html
 * <app-article-list [config]="tagConfig" [limit]="20"></app-article-list>
 * ```
 *
 * Loading States Flow:
 * 1. NOT_LOADED: Initial state, no data requested
 * 2. LOADING: API request in progress, shows loading spinner
 * 3. LOADED: Data received successfully, displays articles or empty state
 * 4. ERROR: Request failed, shows error message (handled by parent)
 *
 * Pagination Strategy:
 * - Server-side pagination: API returns subset of total articles
 * - Client-side navigation: User clicks page numbers to load new data
 * - Offset calculation: (page - 1) * limit for API requests
 * - Total pages calculation: Math.ceil(totalCount / limit)
 *
 * Configuration Flexibility:
 * - ArticleListConfig: Defines API endpoint and filter parameters
 * - Limit: Controls articles per page (configurable by parent)
 * - Filters: Tag filtering, user filtering, feed type selection
 * - Sorting: Newest first, most popular, custom ordering
 *
 * Learning Notes:
 * - Standalone component with explicit imports for dependencies
 * - Input setters enable reactive behavior when configuration changes
 * - takeUntilDestroyed automatically handles subscription cleanup
 * - Modern template syntax improves readability and performance
 * - Reusable design pattern applicable to other list components
 */

import { Component, DestroyRef, inject, Input } from "@angular/core"; // Angular core utilities
import { ArticlesService } from "../services/articles.service"; // Article API service
import { ArticleListConfig } from "../models/article-list-config.model"; // Configuration model
import { Article } from "../models/article.model"; // Article data model
import { ArticlePreviewComponent } from "./article-preview.component"; // Child component for article display
import { NgClass, NgForOf, NgIf } from "@angular/common"; // Template directives
import { LoadingState } from "../../../core/models/loading-state.model"; // Loading state enum
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"; // Subscription cleanup utility

/**
 * Article List Component Definition
 *
 * Standalone component that renders paginated article lists with loading states,
 * pagination controls, and empty state handling.
 *
 * @Component Configuration:
 * - selector: "app-article-list" - HTML tag for component usage
 * - template: Inline template with modern Angular control flow
 * - imports: Required dependencies for standalone component
 * - styles: Component-specific CSS for pagination styling
 * - standalone: true - Independent component without NgModule
 *
 * Template Features:
 * - @if directive: Conditional rendering based on loading state
 * - @for directive: Iterating over articles and pagination numbers
 * - @empty directive: Fallback content when no articles exist
 * - track expressions: Performance optimization for list rendering
 * - Event binding: Click handlers for pagination interaction
 * - Property binding: Dynamic CSS classes and data binding
 *
 * Modern Template Syntax Benefits:
 * - Better performance: Built-in control flow optimizations
 * - Type safety: Better TypeScript integration
 * - Readability: Cleaner syntax compared to *ngIf and *ngFor
 * - Bundle size: Reduced overhead compared to directive-based approach
 *
 * Learning Notes:
 * - Standalone components require explicit imports for all dependencies
 * - Inline templates work well for medium-sized component templates
 * - Modern control flow (@if, @for) is preferred over structural directives
 * - track functions improve performance for list rendering
 */
@Component({
  selector: "app-article-list",
  template: `
    <!--
      Loading State Display
      
      Shows loading indicator when articles are being fetched from the API.
      Uses @if directive for conditional rendering based on loading state.
      
      Loading State Logic:
      - LoadingState.LOADING: API request in progress
      - Displays user-friendly loading message
      - Prevents user interaction during data fetching
      - Provides visual feedback for async operations
      
      Alternative Loading Implementations:
      - Skeleton loaders for better UX
      - Progress bars for long operations
      - Spinner animations for visual appeal
      - Shimmer effects for placeholder content
    -->
    @if (loading === LoadingState.LOADING) {
      <div class="article-preview">Loading articles...</div>
    }

    <!--
      Articles Display and Pagination
      
      Renders article list and pagination controls when data is loaded.
      Uses @if to ensure content only shows after successful API response.
      
      Content Structure:
      - Article list: @for loop with article preview components
      - Empty state: @empty fallback when no articles exist
      - Pagination: Navigation controls for multiple pages
      
      Performance Optimizations:
      - track article.slug: Efficient list updating with unique identifiers
      - Component reuse: ArticlePreviewComponent instances reused when possible
      - Lazy rendering: Only visible articles rendered initially
    -->
    @if (loading === LoadingState.LOADED) {
      <!--
        Article List Rendering
        
        Iterates through article results and renders preview components.
        Uses modern @for syntax with track expression for performance.
        
        @for Features:
        - article of results: Iterates over article array
        - track article.slug: Uses unique slug for change detection optimization
        - @empty: Fallback content when results array is empty
        
        Article Preview Integration:
        - [article]="article": Property binding passes article data
        - Component communication: Child component receives article object
        - Event handling: Child can emit events back to parent if needed
        - Styling: Child component handles individual article presentation
        
        Track Expression Benefits:
        - Performance: Angular reuses components for same articles
        - Memory: Reduces DOM manipulation overhead
        - Smooth updates: Prevents flickering during list changes
        - Efficiency: Only renders changed items during updates
        
        Alternative Rendering Patterns:
        
        Virtual Scrolling (for large lists):
        Use CDK Virtual Scrolling with cdk-virtual-scroll-viewport
        
        Lazy Loading (for performance):
        Load additional articles as user scrolls or clicks load more
      -->
      @for (article of results; track article.slug) {
        <app-article-preview [article]="article" />
      } @empty {
        <!--
          Empty State Handling
          
          Displays when API returns empty results array.
          Provides user-friendly message for various empty scenarios.
          
          Empty State Scenarios:
          - No articles published yet (new tags, new users)
          - All articles filtered out by current criteria
          - User feed empty (not following anyone)
          - Search results with no matches
          
          UX Considerations:
          - Clear messaging about why list is empty
          - Suggested actions for users (follow users, create content)
          - Consistent styling with other article preview cards
          - Helpful text that encourages engagement
          
          Alternative Empty States:
          - Call-to-action buttons for content creation
          - Suggested articles or users to follow
          - Onboarding tips for new users
          - Search suggestions or popular tags
        -->
        <div class="article-preview">No articles are here... yet.</div>
      }

      <!--
        Pagination Navigation Controls
        
        Renders page numbers for navigating through article pages.
        Only shows when multiple pages of content exist.
        
        Pagination Structure:
        - Bootstrap-styled pagination navigation
        - Page number buttons with click handlers
        - Active page highlighting with conditional CSS
        - Accessible navigation with proper semantic markup
        
        Pagination Logic:
        - totalPages: Array of page numbers [1, 2, 3, ...]
        - currentPage: Currently active page number
        - setPageTo(): Click handler for page navigation
        - Active state: Visual indication of current page
        
        Performance Considerations:
        - Client-side pagination: Fast page switching
        - Server-side data: Fresh data for each page
        - Caching potential: Store recent pages in memory
        - Loading states: Show feedback during page changes
      -->
      <nav>
        <ul class="pagination">
          <!--
            Page Number Rendering
            
            Creates clickable page number buttons for navigation.
            Uses @for to iterate through calculated page numbers.
            
            @for Iteration:
            - pageNumber of totalPages: Loops through page number array
            - track pageNumber: Optimizes rendering with unique identifiers
            
            Page Button Features:
            - Dynamic CSS classes: Highlights active page
            - Click handlers: Triggers page change on user interaction
            - Accessibility: Proper button semantics for screen readers
            - Bootstrap styling: Consistent visual appearance
            
            Active Page Logic:
            - [ngClass]: Conditionally applies 'active' class
            - pageNumber === currentPage: Comparison for current page
            - Visual feedback: Shows user their current location
            - Click prevention: Could disable active page button
            
            Alternative Pagination Patterns:
            
            Previous/Next Navigation:
            Could implement previous/next buttons instead of numbered pages
            
            Infinite Scroll (alternative to pagination):
            Load more content as user scrolls near bottom of page
            
            Load More Button:
            Simple button to load additional articles on demand
          -->
          @for (pageNumber of totalPages; track pageNumber) {
            <li
              class="page-item"
              [ngClass]="{ active: pageNumber === currentPage }"
            >
              <button class="page-link" (click)="setPageTo(pageNumber)">
                {{ pageNumber }}
              </button>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  imports: [ArticlePreviewComponent, NgForOf, NgClass, NgIf],
  styles: `
    /*
      Custom Pagination Styling
      
      Enhances default Bootstrap pagination with interactive cursor.
      Provides visual feedback for clickable page elements.
      
      Styling Considerations:
      - Cursor pointer: Indicates clickable elements
      - Hover effects: Additional visual feedback
      - Focus styles: Keyboard navigation support
      - Responsive design: Mobile-friendly touch targets
      
      CSS Architecture:
      - Component-scoped styles using ViewEncapsulation
      - Minimal custom CSS leveraging Bootstrap base
      - Override specific properties as needed
      - Maintain accessibility and usability standards
    */
    .page-link {
      cursor: pointer;
    }
  `,
  standalone: true,
})
export class ArticleListComponent {
  /**
   * Component State Properties
   *
   * Internal state management for article list functionality including
   * query configuration, results, pagination, and loading states.
   */

  /**
   * Query Configuration
   *
   * Stores the current article list configuration that defines
   * how articles should be fetched from the API.
   *
   * ArticleListConfig Contents:
   * - type: Feed type ('all', 'feed', 'tag', 'author', 'favorited')
   * - filters: API query parameters (tag, author, favorited, limit, offset)
   *
   * Configuration Examples:
   *
   * Global Feed:
   * ```typescript
   * { type: 'all', filters: {} }
   * ```
   *
   * Tag Feed:
   * ```typescript
   * { type: 'tag', filters: { tag: 'javascript' } }
   * ```
   *
   * User Articles:
   * ```typescript
   * { type: 'author', filters: { author: 'john-doe' } }
   * ```
   *
   * Learning Notes:
   * - Definite assignment assertion (!) indicates property set via input
   * - Configuration drives API endpoint selection in ArticlesService
   * - Reactive updates when parent component changes configuration
   */
  query!: ArticleListConfig;

  /**
   * Article Results Array
   *
   * Stores the current page of articles loaded from the API.
   * Initialized as empty array and populated after successful API calls.
   *
   * Array Management:
   * - Reset to empty array before new queries
   * - Populated with API response data
   * - Used by template for article rendering
   * - Type safety with Article model interface
   *
   * Data Flow:
   * 1. API call initiated by runQuery()
   * 2. Results cleared during loading
   * 3. API response populates results array
   * 4. Template renders articles from results
   * 5. User pagination triggers new API calls
   */
  results: Article[] = [];

  /**
   * Current Page Number
   *
   * Tracks the currently displayed page in the pagination system.
   * Starts at page 1 and updates based on user navigation.
   *
   * Pagination Logic:
   * - Initialized to 1 for first page
   * - Reset to 1 when configuration changes
   * - Updated by setPageTo() method on user clicks
   * - Used for offset calculation in API queries
   *
   * Page Calculation:
   * - offset = (currentPage - 1) * limit
   * - API returns articles for specific page range
   * - UI highlights current page in pagination controls
   */
  currentPage = 1;

  /**
   * Total Pages Array
   *
   * Array of page numbers used to render pagination controls.
   * Calculated based on total article count and articles per page.
   *
   * Array Generation:
   * - Created from total article count divided by page limit
   * - Contains consecutive integers [1, 2, 3, ..., n]
   * - Updated after each successful API response
   * - Used by template for pagination button rendering
   *
   * Calculation Example:
   * - Total articles: 47
   * - Limit per page: 10
   * - Total pages: Math.ceil(47/10) = 5
   * - Array: [1, 2, 3, 4, 5]
   */
  totalPages: Array<number> = [];

  /**
   * Loading State Management
   *
   * Tracks the current loading state for proper UI feedback.
   * Uses LoadingState enum for type-safe state management.
   *
   * Loading States:
   * - NOT_LOADED: Initial state, no API call made
   * - LOADING: API request in progress
   * - LOADED: Data successfully received
   * - ERROR: API request failed (handled by error interceptor)
   *
   * State Transitions:
   * 1. NOT_LOADED → LOADING: When runQuery() starts
   * 2. LOADING → LOADED: When API responds successfully
   * 3. LOADING → ERROR: When API call fails
   * 4. LOADED → LOADING: When new page requested
   */
  loading = LoadingState.NOT_LOADED;

  /**
   * LoadingState Enum Reference
   *
   * Template-accessible reference to LoadingState enum values.
   * Enables template to compare against enum values directly.
   *
   * Template Usage:
   * ```html
   * @if (loading === LoadingState.LOADING) {
   *   <!-- Loading content -->
   * }
   * ```
   *
   * Alternative Pattern:
   * Could use getter method instead of exposing enum directly
   */
  LoadingState = LoadingState;

  /**
   * Destroy Reference for Cleanup
   *
   * Angular's DestroyRef for automatic subscription cleanup.
   * Used with takeUntilDestroyed to prevent memory leaks.
   *
   * Memory Management:
   * - Automatically unsubscribes from observables
   * - Triggered when component is destroyed
   * - Prevents memory leaks from active subscriptions
   * - Modern alternative to OnDestroy lifecycle hook
   *
   * Usage Pattern:
   * ```typescript
   * this.someObservable
   *   .pipe(takeUntilDestroyed(this.destroyRef))
   *   .subscribe(...);
   * ```
   *
   * Benefits:
   * - Automatic cleanup without manual OnDestroy implementation
   * - Type-safe subscription management
   * - Consistent pattern across components
   * - Reduced boilerplate code
   */
  destroyRef = inject(DestroyRef);

  /**
   * Limit Input Property
   *
   * Configures how many articles to display per page.
   * Set by parent component based on context and design requirements.
   *
   * Usage Examples:
   * - Home page: 10 articles per page
   * - Profile page: 5 articles per page
   * - Tag feed: 20 articles per page
   *
   * Input Characteristics:
   * - @Input(): Property binding from parent component
   * - Required: Definite assignment assertion (!) indicates parent must provide
   * - Immutable: Typically doesn't change during component lifetime
   * - Used for pagination calculations and API queries
   */
  @Input() limit!: number;

  /**
   * Configuration Input Property with Setter
   *
   * Reactive input property that triggers article fetching when configuration changes.
   * Uses setter pattern to perform side effects when parent updates configuration.
   *
   * @param config - ArticleListConfig: New configuration from parent component
   *
   * Setter Functionality:
   * 1. Validates configuration exists
   * 2. Stores configuration in query property
   * 3. Resets pagination to first page
   * 4. Triggers new API query with updated configuration
   *
   * Configuration Change Scenarios:
   * - Feed type change (global → personal feed)
   * - Tag selection (different tag filter)
   * - User navigation (different author profile)
   * - Search filter application
   *
   * Reactive Pattern:
   * - Input changes automatically trigger re-fetch
   * - No manual refresh needed from parent
   * - Seamless user experience during navigation
   * - Consistent loading states during transitions
   *
   * Alternative Patterns:
   *
   * OnChanges Lifecycle:
   * Could use ngOnChanges instead of setter for input change detection
   *
   * Observable Input (Angular 16+):
   * Modern signal-based input handling with effect() for reactive updates
   *
   * Learning Notes:
   * - Input setters enable reactive behavior to property changes
   * - Side effects in setters should be lightweight and synchronous
   * - Validation ensures component robustness
   * - Reset pagination provides consistent user experience
   */
  @Input()
  set config(config: ArticleListConfig) {
    if (config) {
      this.query = config;
      this.currentPage = 1;
      this.runQuery();
    }
  }

  /**
   * Articles Service Injection
   *
   * Constructor injection of ArticlesService for API communication.
   * Provides access to article querying and management functionality.
   *
   * Service Responsibilities:
   * - Execute API calls based on ArticleListConfig
   * - Handle different article feed types (global, user, tag, author)
   * - Return observables with article data and metadata
   * - Manage HTTP request configuration and error handling
   *
   * Constructor Injection:
   * - private: Service accessible only within component
   * - articlesService: Instance property for service access
   * - Singleton: Same service instance used across application
   * - Type safety: Strongly typed service interface
   *
   * Modern Alternative (inject function):
   * Could use inject() function instead of constructor injection
   */
  constructor(private articlesService: ArticlesService) {}

  /**
   * Page Navigation Method
   *
   * Handles user clicks on pagination buttons to change the current page
   * and trigger a new API query for the selected page.
   *
   * @param pageNumber - number: Target page number from pagination click
   *
   * Navigation Process:
   * 1. Update currentPage property with target page
   * 2. Trigger runQuery() to fetch articles for new page
   * 3. API call includes updated offset based on page number
   * 4. UI updates with new articles and pagination state
   *
   * User Experience:
   * - Immediate page update for responsive feedback
   * - Loading state shown during API call
   * - Smooth transition between pages
   * - Consistent pagination highlighting
   *
   * Performance Considerations:
   * - Fresh API call for each page (no client-side caching)
   * - Could implement page caching for better performance
   * - Loading states prevent multiple concurrent requests
   * - Debouncing could prevent rapid clicking issues
   *
   * Enhanced Implementation:
   * Could add validation to prevent redundant calls and loading state checks
   *
   * Accessibility Enhancements:
   * - Announce page changes to screen readers
   * - Keyboard navigation support
   * - Focus management after page loads
   * - ARIA labels for pagination controls
   */
  setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    this.runQuery();
  }

  /**
   * Article Query Execution Method
   *
   * Core method that executes API calls to fetch articles based on current
   * configuration and pagination settings.
   *
   * Query Execution Flow:
   * 1. Set loading state to provide user feedback
   * 2. Clear previous results to prevent stale data display
   * 3. Configure pagination parameters (limit and offset)
   * 4. Execute API call with current query configuration
   * 5. Handle response data and update component state
   * 6. Generate pagination controls based on total count
   *
   * Loading State Management:
   * - LOADING: Shows loading indicator during API call
   * - Prevents user interaction during data fetching
   * - Provides visual feedback for async operations
   * - Automatically cleared when data loads successfully
   *
   * Data Management:
   * - Results cleared before new query to prevent confusion
   * - Fresh data loaded for each query execution
   * - Type-safe handling of Article model objects
   * - Separation of articles data and metadata (count)
   *
   * Error Handling:
   * - HTTP errors handled by global error interceptor
   * - Component-level error handling could be added
   * - Loading state management during error scenarios
   * - User feedback for failed requests
   */
  runQuery() {
    /**
     * Loading State Initialization
     *
     * Sets loading state to show user feedback during API call.
     * Prevents user interactions and shows loading indicator.
     *
     * UI Impact:
     * - Template shows "Loading articles..." message
     * - Hides previous article content
     * - Prevents pagination clicks during loading
     * - Provides immediate user feedback
     */
    this.loading = LoadingState.LOADING;

    /**
     * Results Array Reset
     *
     * Clears previous article results to prevent displaying stale data
     * while new articles are being fetched.
     *
     * Data Management:
     * - Prevents mixing old and new article data
     * - Ensures clean state for new query results
     * - Improves user experience with clear loading state
     * - Memory cleanup for large article arrays
     */
    this.results = [];

    /**
     * Pagination Configuration
     *
     * Configures API query parameters for pagination based on component inputs
     * and current page state. Only applied when limit is specified by parent.
     *
     * Pagination Logic:
     * - limit: Maximum articles per page (from parent component)
     * - offset: Starting article index for current page
     * - Calculation: offset = limit * (currentPage - 1)
     *
     * Examples:
     * - Page 1, Limit 10: offset = 0 (articles 1-10)
     * - Page 2, Limit 10: offset = 10 (articles 11-20)
     * - Page 3, Limit 10: offset = 20 (articles 21-30)
     *
     * Conditional Application:
     * - Only applies pagination when limit is provided
     * - Allows component to work without pagination if needed
     * - Parent component controls pagination behavior
     * - Flexible configuration for different use cases
     */
    if (this.limit) {
      this.query.filters.limit = this.limit;
      this.query.filters.offset = this.limit * (this.currentPage - 1);
    }

    /**
     * API Query Execution with Subscription Management
     *
     * Executes the articles API call with proper subscription cleanup
     * and response handling for article data and pagination metadata.
     *
     * Observable Pipeline:
     * 1. articlesService.query(): Returns Observable<ArticleListResponse>
     * 2. pipe(): Applies RxJS operators
     * 3. takeUntilDestroyed(): Automatic subscription cleanup
     * 4. subscribe(): Handles response data
     *
     * Subscription Cleanup:
     * - takeUntilDestroyed(this.destroyRef): Automatic unsubscribe on destroy
     * - Prevents memory leaks from active subscriptions
     * - No manual OnDestroy implementation needed
     * - Modern Angular pattern for subscription management
     *
     * Response Handling:
     * - data.articles: Array of article objects for display
     * - data.articlesCount: Total article count for pagination
     * - Loading state updated to LOADED on success
     * - Error handling delegated to global error interceptor
     *
     * API Response Structure:
     * ```typescript
     * {
     *   articles: Article[],     // Current page articles
     *   articlesCount: number    // Total available articles
     * }
     * ```
     */
    this.articlesService
      .query(this.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        /**
         * Successful Response Processing
         *
         * Updates component state with API response data and transitions
         * to loaded state for UI updates.
         *
         * State Updates:
         * 1. Set loading state to LOADED
         * 2. Populate results with article data
         * 3. Generate pagination controls
         *
         * Loading State Transition:
         * - LOADING → LOADED: Successful data fetch
         * - Triggers template to show articles and pagination
         * - Hides loading indicator
         * - Enables user interaction with content
         */
        this.loading = LoadingState.LOADED;
        this.results = data.articles;

        /**
         * Pagination Controls Generation
         *
         * Calculates total pages and generates array of page numbers
         * for pagination navigation controls.
         *
         * Calculation Process:
         * 1. Math.ceil(data.articlesCount / this.limit): Total pages needed
         * 2. Array.from(): Creates array with calculated length
         * 3. new Array(length): Creates sparse array of target length
         * 4. (val, index) => index + 1: Maps indices to page numbers
         *
         * Array Generation Technique:
         * - Creates array [1, 2, 3, ..., totalPages]
         * - Used for rendering pagination buttons
         * - Efficient one-liner for sequential number arrays
         * - Referenced from JavaScript tips for best practices
         *
         * Examples:
         * - 25 articles, 10 per page: [1, 2, 3]
         * - 47 articles, 10 per page: [1, 2, 3, 4, 5]
         * - 100 articles, 20 per page: [1, 2, 3, 4, 5]
         *
         * Performance Considerations:
         * - Array regenerated on each query
         * - Could memoize for repeated identical counts
         * - Small arrays so performance impact minimal
         * - Template optimization with track expressions
         *
         * Alternative Implementation:
         * ```typescript
         * const totalPagesCount = Math.ceil(data.articlesCount / this.limit);
         * this.totalPages = [];
         * for (let i = 1; i <= totalPagesCount; i++) {
         *   this.totalPages.push(i);
         * }
         * ```
         *
         * Advanced Pagination Features:
         * - Could implement page ranges for large datasets
         * - Previous/Next navigation addition
         * - Jump to page input field
         * - Results per page selection
         */
        this.totalPages = Array.from(
          new Array(Math.ceil(data.articlesCount / this.limit)),
          (val, index) => index + 1,
        );
      });
  }
}
