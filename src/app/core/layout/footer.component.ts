/**
 * Application Footer Layout Component
 *
 * Simple presentation component that renders the application footer with
 * copyright information, current year display, and navigation links.
 * This component demonstrates modern Angular patterns including OnPush
 * change detection and standalone component architecture.
 *
 * Key Concepts Demonstrated:
 * - Presentation Components: Pure UI components without complex business logic
 * - OnPush Change Detection: Performance optimization for static content
 * - Standalone Components: Modern Angular architecture without NgModule dependencies
 * - External Template Files: Separation of concerns with templateUrl
 * - Date Handling: JavaScript Date API integration with Angular pipes
 * - Layout Components: Structural components for application shell
 *
 * Component Responsibilities:
 * - Display application footer across all pages
 * - Show current year for copyright information
 * - Provide navigation links to key application pages
 * - Maintain consistent footer styling and branding
 * - Serve as part of the application layout shell
 *
 * Performance Characteristics:
 * - OnPush Change Detection: Only updates when inputs change
 * - Static Content: Minimal re-rendering requirements
 * - Lightweight Component: Simple state and minimal logic
 * - Efficient Rendering: Fast initial load and updates
 *
 * Usage in Application:
 * - App Shell: Part of main application layout
 * - Global Visibility: Appears on all application pages
 * - Consistent Branding: Maintains application identity
 * - Navigation Support: Provides footer-level navigation
 *
 * Design Patterns:
 * - Layout Component: Structural component for page organization
 * - Presentation Component: Focused on display rather than logic
 * - Stateless Component: Minimal internal state management
 * - Reusable Component: Can be used across different application contexts
 *
 * Learning Notes:
 * - Simple components benefit from OnPush change detection
 * - External templates improve code organization and maintainability
 * - Date.now() provides current timestamp for dynamic year display
 * - Standalone components reduce bundle size and improve tree-shaking
 */

import { ChangeDetectionStrategy, Component } from "@angular/core"; // Angular core utilities
import { DatePipe } from "@angular/common"; // Date formatting pipe
import { RouterLink } from "@angular/router"; // Navigation directive

/**
 * Footer Component Definition
 *
 * Standalone component that renders the application footer with OnPush
 * change detection for optimal performance.
 *
 * @Component Configuration:
 * - selector: "app-layout-footer" - HTML tag for footer usage in layouts
 * - templateUrl: External HTML file for template separation
 * - changeDetection: OnPush strategy for performance optimization
 * - imports: Dependencies required for standalone component
 * - standalone: true - Independent component without NgModule requirement
 *
 * Change Detection Strategy:
 * - OnPush: Component only checks for changes when:
 *   1. Input properties change (component has no inputs)
 *   2. Event is emitted from component or children
 *   3. Async pipe receives new value
 *   4. Change detection manually triggered
 *
 * OnPush Benefits for Footer:
 * - Performance: Reduces unnecessary change detection cycles
 * - Efficiency: Footer content rarely changes during application lifecycle
 * - Optimization: Component tree pruning during change detection
 * - Best Practice: Recommended for presentation components
 *
 * Template Architecture:
 * - External Template: Keeps component class focused on logic
 * - HTML Separation: Improves maintainability and readability
 * - Template Caching: Angular CLI optimizes external template loading
 * - Code Organization: Clear separation of concerns
 *
 * Standalone Component Benefits:
 * - Module Independence: No NgModule declarations required
 * - Tree Shaking: Better bundle optimization
 * - Lazy Loading: Can be imported only where needed
 * - Simplified Testing: Isolated component testing without module setup
 *
 * Import Dependencies:
 * - DatePipe: Angular pipe for date formatting in templates
 * - RouterLink: Directive for client-side navigation links
 * - Explicit Imports: Required for standalone components
 *
 * Learning Notes:
 * - OnPush is ideal for components with minimal dynamic content
 * - External templates scale better than inline templates
 * - Standalone components are the modern Angular approach
 * - Layout components typically use OnPush for performance
 *
 * Alternative Implementations:
 *
 * Inline Template Version:
 * ```typescript
 * @Component({
 *   selector: "app-layout-footer",
 *   template: `
 *     <footer>
 *       <p>&copy; {{ today | date:'yyyy' }} RealWorld App</p>
 *     </footer>
 *   `,
 *   // ... other configuration
 * })
 * ```
 *
 * Default Change Detection:
 * ```typescript
 * @Component({
 *   selector: "app-layout-footer",
 *   templateUrl: "./footer.component.html",
 *   // changeDetection: ChangeDetectionStrategy.Default (implicit)
 *   // ... other configuration
 * })
 * ```
 *
 * Module-Based Component:
 * ```typescript
 * @Component({
 *   selector: "app-layout-footer",
 *   templateUrl: "./footer.component.html",
 *   // standalone: false (would require NgModule declaration)
 * })
 * ```
 */
@Component({
  selector: "app-layout-footer", // Component selector for template usage
  templateUrl: "./footer.component.html", // External template file path
  changeDetection: ChangeDetectionStrategy.OnPush, // Performance-optimized change detection
  imports: [DatePipe, RouterLink], // Standalone component dependencies
  standalone: true, // Independent component architecture
})
export class FooterComponent {
  /**
   * Current Timestamp Property
   *
   * Stores the current timestamp for dynamic year display in the footer.
   * Used with DatePipe to show current year in copyright notice.
   *
   * Property Details:
   * - Type: number - JavaScript timestamp in milliseconds
   * - Value: Date.now() - Current time when component initializes
   * - Usage: Template binding for year extraction with DatePipe
   * - Scope: Public property accessible to template
   *
   * Date.now() Explanation:
   * - Returns: Current timestamp as number of milliseconds since Unix epoch
   * - Static Method: Called on Date constructor, not instance
   * - Performance: More efficient than new Date() for timestamp needs
   * - Precision: Millisecond-level timestamp accuracy
   *
   * Template Integration:
   * - DatePipe Usage: {{ today | date:'yyyy' }} extracts year
   * - Dynamic Year: Automatically shows current year without manual updates
   * - Copyright Display: Common pattern for footer copyright notices
   * - Maintenance-Free: No need to update year manually each year
   *
   * OnPush Compatibility:
   * - Static Value: Set once during component initialization
   * - No Updates: Component doesn't need to track time changes
   * - Performance: OnPush strategy works well with static timestamp
   * - Initialization: Value captured when component loads
   *
   * Alternative Implementations:
   *
   * Getter Method (Dynamic Updates):
   * ```typescript
   * get today(): number {
   *   return Date.now();
   * }
   * ```
   * Note: This would require Default change detection for updates
   *
   * Date Object:
   * ```typescript
   * today: Date = new Date();
   * ```
   *
   * String Year:
   * ```typescript
   * currentYear: string = new Date().getFullYear().toString();
   * ```
   *
   * Reactive Updates (if needed):
   * ```typescript
   * today$ = timer(0, 1000).pipe(map(() => Date.now()));
   * ```
   * Template: {{ today$ | async | date:'yyyy' }}
   *
   * Learning Notes:
   * - Date.now() is more efficient than new Date() for timestamps
   * - DatePipe handles timezone and formatting automatically
   * - Static timestamps work well with OnPush change detection
   * - Year extraction through pipes keeps template declarative
   * - Copyright notices typically show year when page loads, not real-time
   *
   * Real-World Considerations:
   * - Static Year: Acceptable for most applications (page refresh updates year)
   * - Server-Side Rendering: Date.now() captures server time during SSR
   * - Time Zones: DatePipe respects user's local timezone
   * - Accessibility: Screen readers can properly announce year information
   * - SEO: Static content benefits search engine indexing
   *
   * Footer Content Patterns:
   * - Copyright Notice: Legal requirement for many applications
   * - Company Branding: Maintains application identity across pages
   * - Navigation Links: Secondary navigation for less prominent pages
   * - Contact Information: Support and business contact details
   * - Legal Links: Terms of service, privacy policy, etc.
   */
  today: number = Date.now();
}
