/**
 * Article Comment Component
 *
 * This component displays individual comments for articles and provides functionality
 * for comment interaction including author profile links and delete capabilities.
 * It demonstrates several key Angular concepts for building reusable UI components.
 *
 * Key Concepts Demonstrated:
 * - Component Communication: Input/Output pattern for parent-child communication
 * - Reactive Programming: Using observables for dynamic permission checking
 * - Inline Templates: Template definition within component decorator
 * - Modern Angular: Control flow syntax (@if) and standalone components
 * - User Authorization: Permission-based UI element display
 * - Event Emission: Child-to-parent communication via EventEmitter
 *
 * Component Responsibilities:
 * - Display comment content and metadata (author, date, body)
 * - Provide navigation to comment author's profile
 * - Show delete option only to comment authors
 * - Emit delete events to parent component for handling
 * - Handle user authorization for comment modification
 *
 * Usage Pattern:
 * <app-article-comment
 *   [comment]="commentData"
 *   (delete)="handleCommentDelete($event)">
 * </app-article-comment>
 *
 * Data Flow:
 * 1. Parent provides comment data via @Input
 * 2. Component displays comment with author information
 * 3. Component checks if current user can modify comment
 * 4. If authorized, shows delete option
 * 5. User clicks delete, component emits event to parent
 * 6. Parent handles actual deletion logic
 */

import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { UserService } from "../../../core/auth/services/user.service";
import { User } from "../../../core/auth/user.model";
import { RouterLink } from "@angular/router";
import { map } from "rxjs/operators";
import { Comment } from "../models/comment.model";
import { AsyncPipe, DatePipe, NgIf } from "@angular/common";

/**
 * Component Decorator Configuration
 *
 * Configures the component with inline template and necessary imports
 * for a self-contained, reusable comment display component.
 */
@Component({
  /**
   * Component Selector
   *
   * @selector "app-article-comment"
   * - Defines HTML tag: <app-article-comment></app-article-comment>
   * - Follows naming convention: app-[feature]-[component]
   * - "article-comment" clearly identifies this as article-related comment component
   * - Used by parent components to render individual comment instances
   *
   * Learning Notes:
   * - Descriptive selectors improve code readability and maintenance
   * - Feature-based naming helps organize components by domain
   * - Component selectors should be unique across the application
   */
  selector: "app-article-comment",

  /**
   * Inline Template Definition
   *
   * Uses template property instead of templateUrl for a self-contained component.
   * Demonstrates modern Angular template syntax and conditional rendering.
   *
   * Template Structure:
   * - Card-based layout using Bootstrap classes
   * - Comment body display with interpolation
   * - Author information with profile links
   * - Conditional delete option based on user permissions
   *
   * Learning Notes:
   * - Inline templates are suitable for smaller, focused components
   * - Modern @if syntax replaces *ngIf for better readability
   * - Template expressions enable dynamic content rendering
   * - Conditional UI elements improve user experience and security
   */
  template: `
    <!-- 
      Main Comment Container with Conditional Rendering
      
      @if (comment) - Modern Angular control flow syntax (v17+)
      - Replaces *ngIf structural directive with more readable syntax
      - Only renders comment if comment data exists
      - Prevents template errors when comment is null/undefined
      - More performant than traditional structural directives
      
      Learning Notes:
      - @if is part of Angular's new control flow syntax
      - Provides better type inference and performance
      - Guards against null/undefined data scenarios
      - Essential for components that receive data asynchronously
    -->
    @if (comment) {
      <!-- 
        Bootstrap Card Layout
        
        Uses Bootstrap CSS classes for consistent styling:
        - card: Bootstrap component for content containers
        - card-block: Content area within card (deprecated, use card-body)
        - card-footer: Footer area for metadata and actions
        
        Learning Notes:
        - Bootstrap provides consistent, responsive UI components
        - Card pattern is common for displaying discrete content items
        - Semantic HTML structure improves accessibility
      -->
      <div class="card">
        <!-- 
          Comment Content Area
          
          Displays the main comment text using interpolation.
          Simple, direct display of user-generated content.
        -->
        <div class="card-block">
          <!-- 
            Comment Body Display
            
            {{ comment.body }} - Angular interpolation syntax
            - Displays comment text content
            - Automatically handles HTML escaping for security
            - Updates automatically when comment data changes
            - Safe rendering prevents XSS attacks
            
            Learning Notes:
            - Interpolation is Angular's simplest data binding mechanism
            - Double curly braces render data as escaped text
            - Automatic change detection updates display when data changes
            - Security: Prevents malicious script injection
          -->
          <p class="card-text">
            {{ comment.body }}
          </p>
        </div>

        <!-- 
          Comment Metadata and Actions
          
          Footer area containing author information, timestamp,
          and conditional modification options.
        -->
        <div class="card-footer">
          <!-- 
            Author Profile Image Link
            
            Clickable author avatar that navigates to author's profile.
            Demonstrates RouterLink with dynamic route parameters.
          -->
          <a
            class="comment-author"
            [routerLink]="['/profile', comment.author.username]"
          >
            <!-- 
              Dynamic Author Avatar
              
              [src]="comment.author.image" - Property binding for dynamic image source
              - Binds image src attribute to author's profile image URL
              - Square brackets indicate property binding (one-way data binding)
              - Automatically updates if author image changes
              - Handles missing/broken images gracefully
              
              Learning Notes:
              - Property binding uses [attribute]="expression" syntax
              - Enables dynamic attribute values based on component data
              - More flexible than static HTML attributes
              - Essential for data-driven UI components
            -->
            <img [src]="comment.author.image" class="comment-author-img" />
          </a>

          <!-- 
            Visual Spacing
            
            &nbsp; - Non-breaking space for consistent layout spacing
            - Ensures proper spacing between avatar and username
            - Prevents line breaks that could disrupt layout
            - Simple solution for minor spacing adjustments
            
            Learning Notes:
            - HTML entities provide special characters in templates
            - Non-breaking spaces prevent unwanted line breaks
            - CSS margins/padding are often better for spacing
            - Useful for quick layout adjustments
          -->
          &nbsp;

          <!-- 
            Author Username Link
            
            Clickable author name that navigates to profile page.
            Same navigation pattern as avatar for consistent UX.
          -->
          <a
            class="comment-author"
            [routerLink]="['/profile', comment.author.username]"
          >
            <!-- 
              Dynamic Username Display
              
              {{ comment.author.username }} - Displays author's username
              - Text interpolation for dynamic username display
              - Provides textual link alongside visual avatar
              - Improves accessibility with text-based navigation
              
              Learning Notes:
              - Multiple navigation options improve user experience
              - Text links provide accessibility for screen readers
              - Consistent navigation patterns across UI elements
            -->
            {{ comment.author.username }}
          </a>

          <!-- 
            Comment Timestamp
            
            Displays when the comment was created using Angular's DatePipe
            for formatted date presentation.
          -->
          <span class="date-posted">
            <!-- 
              Formatted Date Display
              
              {{ comment.createdAt | date: "longDate" }} - Pipe transformation
              - Uses Angular's DatePipe for date formatting
              - "longDate" format provides human-readable date
              - Pipe operator (|) transforms data for display
              - Locale-aware formatting based on user's language settings
              
              Learning Notes:
              - Pipes transform data for display without changing source data
              - DatePipe provides various formatting options (short, medium, long, full)
              - Locale support enables internationalization
              - Pipes are chainable: {{ date | date | uppercase }}
              
              Example Outputs:
              - longDate: "January 15, 2025"
              - shortDate: "1/15/25" 
              - medium: "Jan 15, 2025, 3:30:45 PM"
            -->
            {{ comment.createdAt | date: "longDate" }}
          </span>

          <!-- 
            Conditional Modification Options
            
            @if (canModify$ | async) - Modern conditional rendering with observable
            - Only shows delete option if current user owns the comment
            - Uses AsyncPipe to subscribe to canModify$ observable
            - Reactive permission checking based on authentication state
            - Prevents unauthorized users from seeing modification options
            
            Learning Notes:
            - Authorization should be checked both in UI and backend
            - AsyncPipe automatically manages observable subscriptions
            - Reactive permissions update when authentication state changes
            - UI security complements but doesn't replace backend security
          -->
          @if (canModify$ | async) {
            <span class="mod-options">
              <!-- 
                Delete Comment Button
                
                Click event emits delete signal to parent component.
                Uses event binding to communicate user intent upward.
              -->
              <i class="ion-trash-a" (click)="delete.emit(true)"></i>
              <!-- 
                Event Binding Explanation:
                
                (click)="delete.emit(true)" - Event binding with EventEmitter
                - Parentheses indicate event binding (listens for events)
                - click: DOM event triggered when user clicks element
                - delete.emit(true): Emits event through @Output EventEmitter
                - true: Boolean value indicating delete action requested
                - Parent component receives event and handles deletion logic
                
                Learning Notes:
                - Event binding uses (event)="handler" syntax
                - EventEmitter enables child-to-parent communication
                - Separation of concerns: child emits intent, parent handles action
                - Icon-based UI elements should have accessibility considerations
                
                Accessibility Note:
                - Should include aria-label or title for screen readers
                - Consider keyboard navigation support
                - Visual icons need textual alternatives
              -->
            </span>
          }
        </div>
      </div>
    }
  `,

  /**
   * Component Imports (Standalone Dependencies)
   *
   * All Angular directives, pipes, and components needed by the template.
   * Demonstrates modern standalone component dependency management.
   */
  imports: [
    /**
     * RouterLink - Angular routing directive for navigation
     * - Enables declarative navigation to author profile pages
     * - Supports parameterized routes with dynamic values
     * - Prevents full page reloads during navigation
     * - Integrates with Angular's routing system
     */
    RouterLink,

    /**
     * DatePipe - Angular pipe for date formatting
     * - Transforms Date objects into formatted strings
     * - Locale-aware formatting for internationalization
     * - Multiple format options (short, medium, long, full, custom)
     * - Used in template: {{ date | date: 'format' }}
     */
    DatePipe,

    /**
     * NgIf - Conditional rendering directive (legacy support)
     * - Included for compatibility with older Angular patterns
     * - Modern @if syntax preferred over *ngIf
     * - Structural directive for DOM element addition/removal
     * - Maintains backward compatibility
     */
    NgIf,

    /**
     * AsyncPipe - Observable subscription management pipe
     * - Automatically subscribes to observables in templates
     * - Handles subscription cleanup to prevent memory leaks
     * - Essential for reactive programming patterns
     * - Used with canModify$ observable for permission checking
     */
    AsyncPipe,
  ],

  /**
   * Standalone Component Flag
   *
   * @standalone true
   * - Modern Angular component architecture (v14+)
   * - No NgModule declarations required
   * - Direct dependency imports in component
   * - Better tree-shaking and bundle optimization
   */
  standalone: true,
})

/**
 * Article Comment Component Class
 *
 * Handles comment display logic, user authorization, and parent communication.
 * Demonstrates input/output patterns and reactive programming.
 *
 * Learning Notes:
 * - Export keyword enables component use in other modules/components
 * - Class-based component architecture with decorators
 * - Property-based dependency injection with inject() function
 * - Reactive programming with observables for dynamic behavior
 */
export class ArticleCommentComponent {
  /**
   * Comment Data Input Property
   *
   * @Input() comment!: Comment
   * - Receives comment data from parent component
   * - Required input indicated by non-null assertion operator (!)
   * - Strongly typed with Comment interface for type safety
   * - Parent component binds data: [comment]="commentData"
   *
   * Learning Notes:
   * - @Input decorator enables parent-to-child data flow
   * - Non-null assertion (!) indicates required input
   * - Type safety through interface typing (Comment)
   * - Property binding syntax in parent: [propertyName]="value"
   *
   * Usage in Parent:
   * <app-article-comment [comment]="singleComment"></app-article-comment>
   *
   * Component Communication:
   * - One-way data binding from parent to child
   * - Parent controls what data is displayed
   * - Child component renders data without modifying it
   * - Changes in parent data automatically update child display
   */
  @Input() comment!: Comment;

  /**
   * Delete Event Emitter
   *
   * @Output() delete = new EventEmitter<boolean>()
   * - Emits events to parent component when deletion is requested
   * - EventEmitter<boolean> provides type safety for emitted values
   * - Parent component listens: (delete)="handleDelete($event)"
   * - Enables child-to-parent communication for user actions
   *
   * Learning Notes:
   * - @Output decorator enables child-to-parent communication
   * - EventEmitter is Angular's mechanism for custom events
   * - Generic typing <boolean> ensures type safety for emitted values
   * - Parent listens with event binding: (eventName)="handler($event)"
   *
   * Usage in Parent:
   * <app-article-comment
   *   [comment]="comment"
   *   (delete)="deleteComment($event)">
   * </app-article-comment>
   *
   * Event Flow:
   * 1. User clicks delete icon in child component
   * 2. Child emits: this.delete.emit(true)
   * 3. Parent receives event in deleteComment() method
   * 4. Parent handles actual deletion logic and API calls
   * 5. Parent updates comment list to reflect deletion
   *
   * Design Pattern Benefits:
   * - Separation of concerns: child handles UI, parent handles business logic
   * - Reusable component doesn't need to know about deletion implementation
   * - Parent maintains control over data manipulation
   * - Testable architecture with clear component responsibilities
   */
  @Output() delete = new EventEmitter<boolean>();

  /**
   * Permission Check Observable
   *
   * Reactive property that determines if current user can modify this comment.
   * Demonstrates modern Angular dependency injection and reactive programming.
   *
   * @property canModify$ - Observable<boolean>
   * - $ suffix indicates observable (naming convention)
   * - Reactive computation based on current user and comment author
   * - Updates automatically when authentication state changes
   * - Used with AsyncPipe in template for reactive UI updates
   *
   * Implementation Details:
   * - inject(UserService): Modern dependency injection pattern
   * - .currentUser: Observable stream of current authenticated user
   * - .pipe(map(...)): RxJS operator for data transformation
   * - map(): Transforms user data to boolean permission result
   *
   * Learning Notes:
   *
   * Modern Dependency Injection:
   * - inject() function is alternative to constructor injection
   * - More concise than traditional constructor-based DI
   * - Can be used in component properties and methods
   * - Follows functional programming principles
   *
   * Reactive Programming Pattern:
   * - Observable stream provides automatic updates
   * - No manual subscription management needed (AsyncPipe handles it)
   * - Reactive permissions update when login/logout occurs
   * - Real-time UI updates based on authentication changes
   *
   * Permission Logic:
   * - Compares current user's username with comment author's username
   * - Returns true only if current user owns the comment
   * - Null-safe comparison handles unauthenticated users
   * - Boolean result enables simple conditional rendering
   *
   * Security Considerations:
   * - UI permission checking improves user experience
   * - Backend must also validate permissions for actual operations
   * - Client-side checks are for UX, not security enforcement
   * - API endpoints should validate user authorization independently
   *
   * Observable Chain Breakdown:
   * 1. UserService.currentUser emits current user data
   * 2. map() operator transforms user data to permission boolean
   * 3. Comparison: userData?.username === this.comment.author.username
   * 4. Result boolean indicates if user can modify comment
   * 5. AsyncPipe in template subscribes and updates UI automatically
   *
   * Alternative Implementation (Traditional):
   * constructor(private userService: UserService) {}
   * ngOnInit() {
   *   this.canModify$ = this.userService.currentUser.pipe(
   *     map(user => user?.username === this.comment.author.username)
   *   );
   * }
   */
  canModify$ = inject(UserService).currentUser.pipe(
    map(
      (userData: User | null) =>
        userData?.username === this.comment.author.username,
    ),
  );
}
