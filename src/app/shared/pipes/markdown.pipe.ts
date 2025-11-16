/**
 * Markdown Transformation Pipe
 *
 * Angular pipe that transforms Markdown text into sanitized HTML using the
 * marked library for parsing and Angular's DomSanitizer for XSS protection.
 * This pipe enables rich text content display in templates while maintaining security.
 *
 * Key Concepts Demonstrated:
 * - Custom Angular Pipes: Creating reusable data transformation utilities
 * - Async Pipes: Handling asynchronous operations in template expressions
 * - Dynamic Imports: Lazy loading external libraries for performance optimization
 * - Content Sanitization: XSS protection for user-generated HTML content
 * - Security Context Management: Proper HTML sanitization practices
 * - Modern Dependency Injection: Using inject() function for cleaner code
 *
 * Pipe Responsibilities:
 * - Transform Markdown syntax to HTML markup
 * - Sanitize generated HTML to prevent XSS attacks
 * - Lazy load marked library for optimal bundle size
 * - Handle async operations in template context
 * - Provide safe HTML output for template rendering
 *
 * Markdown Transformation Examples:
 * Input:  "# Hello World\n**Bold text** and *italic*"
 * Output: "<h1>Hello World</h1><p><strong>Bold text</strong> and <em>italic</em></p>"
 *
 * Input:  "[Link](https://example.com)\n\n```js\nconsole.log('code');\n```"
 * Output: "<p><a href=\"https://example.com\">Link</a></p><pre><code class=\"language-js\">console.log('code');</code></pre>"
 *
 * Security Features:
 * - XSS Prevention: DomSanitizer removes malicious scripts and attributes
 * - Content Filtering: Unsafe HTML elements and attributes are stripped
 * - URL Validation: Malicious URLs in links are neutralized
 * - Script Blocking: <script> tags and javascript: URLs are removed
 * - Attribute Sanitization: Dangerous attributes like onclick are filtered
 *
 * Performance Optimizations:
 * - Dynamic Import: marked library loaded only when pipe is used
 * - Tree Shaking: Unused marked features can be eliminated at build time
 * - Async Processing: Non-blocking transformation for better user experience
 * - Memoization Potential: Could cache results for repeated content
 *
 * Usage in Templates:
 * ```html
 * <!-- Basic usage with async pipe -->
 * <div [innerHTML]="article.body | markdown | async"></div>
 *
 * <!-- With loading state -->
 * <div *ngIf="article.body | markdown | async as htmlContent; else loading">
 *   <div [innerHTML]="htmlContent"></div>
 * </div>
 * <ng-template #loading>Loading content...</ng-template>
 * ```
 *
 * Integration with RealWorld Features:
 * - Article Content: Transform article body Markdown to HTML
 * - Comment Display: Convert comment text with basic formatting
 * - User Profiles: Display bio content with rich formatting
 * - Editor Preview: Live preview of Markdown content during editing
 *
 * Learning Notes:
 * - Async pipes handle Promise return values automatically
 * - Dynamic imports enable code splitting and lazy loading
 * - DomSanitizer is essential for user-generated HTML content
 * - Standalone pipes work independently without NgModule declarations
 * - SecurityContext.HTML specifically handles HTML content sanitization
 */

import { inject, Pipe, PipeTransform, SecurityContext } from "@angular/core"; // Angular core utilities
import { DomSanitizer } from "@angular/platform-browser"; // XSS protection service

/**
 * Markdown to HTML Transformation Pipe
 *
 * Standalone Angular pipe that converts Markdown text to sanitized HTML
 * using async transformation with the marked library and security validation.
 *
 * @Pipe Configuration:
 * - name: "markdown" - Template usage identifier
 * - standalone: true - Independent pipe, no NgModule required
 *
 * Standalone Pipe Benefits:
 * - Module Independence: No NgModule declarations needed
 * - Tree Shaking: Better optimization for unused pipes
 * - Lazy Loading: Can be imported only where needed
 * - Cleaner Architecture: Reduced module complexity
 * - Better Testing: Isolated unit testing without module setup
 *
 * Pipe Usage Patterns:
 *
 * Basic HTML Rendering:
 * ```html
 * <div [innerHTML]="markdownText | markdown | async"></div>
 * ```
 *
 * With Error Handling:
 * ```html
 * <div [innerHTML]="(markdownText | markdown | async) || 'Loading...'"></div>
 * ```
 *
 * Conditional Rendering:
 * ```html
 * <ng-container *ngIf="markdownText | markdown | async as html">
 *   <div [innerHTML]="html"></div>
 * </ng-container>
 * ```
 *
 * Learning Notes:
 * - @Pipe decorator marks class as Angular pipe
 * - PipeTransform interface enforces transform() method
 * - Standalone pipes simplify component imports
 * - Async pipes handle Promise/Observable return values
 */
@Pipe({
  name: "markdown", // Pipe name used in templates: {{ content | markdown }}
  standalone: true, // Independent pipe without NgModule requirement
})
export class MarkdownPipe implements PipeTransform {
  /**
   * DOM Sanitization Service
   *
   * Angular's built-in security service that prevents XSS attacks by
   * sanitizing HTML content and removing potentially dangerous elements.
   *
   * Modern Dependency Injection:
   * - inject(): Function-based DI instead of constructor injection
   * - Cleaner syntax for standalone components and pipes
   * - Better tree-shaking and type inference
   * - Consistent with modern Angular patterns
   *
   * DomSanitizer Capabilities:
   * - HTML Sanitization: Removes <script>, onclick, etc.
   * - URL Validation: Prevents javascript: and data: URLs
   * - Style Sanitization: Filters dangerous CSS properties
   * - Resource URL Validation: Validates src attributes
   * - Trusted Content APIs: Bypass sanitization for trusted sources
   *
   * Alternative Injection Pattern (Constructor):
   * ```typescript
   * constructor(private domSanitizer: DomSanitizer) {}
   * ```
   *
   * Security Context Types:
   * - SecurityContext.HTML: For HTML content (our use case)
   * - SecurityContext.STYLE: For CSS styles
   * - SecurityContext.SCRIPT: For JavaScript code
   * - SecurityContext.URL: For general URLs
   * - SecurityContext.RESOURCE_URL: For src/href attributes
   *
   * Learning Notes:
   * - inject() is the modern way to inject dependencies
   * - DomSanitizer is essential for user-generated content
   * - Security contexts determine sanitization rules
   * - Sanitization happens automatically in Angular templates
   */
  domSanitizer = inject(DomSanitizer);

  /**
   * Asynchronous Markdown Transformation Method
   *
   * Converts Markdown text to sanitized HTML using dynamic import for
   * the marked library and Angular's security sanitization.
   *
   * @param content - string: Raw Markdown text to transform
   * @returns Promise<string>: Sanitized HTML ready for template rendering
   *
   * Async Pipe Integration:
   * - Returns Promise that async pipe automatically handles
   * - Template shows loading state until Promise resolves
   * - Error handling managed by async pipe
   * - Automatic subscription/unsubscription lifecycle
   *
   * Method Signature Analysis:
   * - async transform(): Returns Promise for async pipe compatibility
   * - content: string: Input Markdown content from template
   * - Promise<string>: Output HTML for [innerHTML] binding
   *
   * Transformation Pipeline:
   * 1. Dynamic import of marked library
   * 2. Parse Markdown to HTML using marked.parse()
   * 3. Sanitize HTML using DomSanitizer
   * 4. Return safe HTML string
   *
   * Error Handling Considerations:
   * - Dynamic import failures (network issues)
   * - Marked parsing errors (malformed Markdown)
   * - Sanitization failures (corrupted content)
   * - Empty content edge cases
   *
   * Performance Considerations:
   * - marked library loaded once per application
   * - Parsing happens on every pipe execution
   * - Sanitization overhead for security
   * - Consider caching for repeated content
   *
   * Alternative Synchronous Implementation:
   * ```typescript
   * transform(content: string): string {
   *   // Requires marked to be pre-imported
   *   const html = marked.parse(content);
   *   return this.domSanitizer.sanitize(SecurityContext.HTML, html) || '';
   * }
   * ```
   *
   * Caching Implementation Example:
   * ```typescript
   * private cache = new Map<string, string>();
   *
   * async transform(content: string): Promise<string> {
   *   if (this.cache.has(content)) {
   *     return this.cache.get(content)!;
   *   }
   *
   *   const result = await this.processMarkdown(content);
   *   this.cache.set(content, result);
   *   return result;
   * }
   * ```
   */
  async transform(content: string): Promise<string> {
    /**
     * Dynamic Library Import
     *
     * Lazy loads the marked Markdown parsing library only when needed,
     * reducing initial bundle size and improving application startup performance.
     *
     * Dynamic Import Benefits:
     * - Code Splitting: marked library in separate chunk
     * - Lazy Loading: Loaded only when pipe is first used
     * - Bundle Optimization: Smaller main bundle size
     * - Tree Shaking: Unused marked features can be eliminated
     * - Performance: Faster initial application load
     *
     * Import Process:
     * 1. import("marked"): Returns Promise with marked module
     * 2. Destructuring: Extract marked object from module
     * 3. Caching: Browser caches module for subsequent imports
     * 4. await: Wait for module loading before proceeding
     *
     * Alternative Static Import:
     * ```typescript
     * import { marked } from "marked";  // Static import (larger bundle)
     * ```
     *
     * Marked Library Features:
     * - GitHub Flavored Markdown support
     * - Syntax highlighting hooks
     * - Custom renderer extensions
     * - HTML sanitization integration
     * - Performance optimizations
     *
     * Learning Notes:
     * - Dynamic imports return Promises
     * - Webpack creates separate chunks for dynamic imports
     * - First import loads library, subsequent calls use cache
     * - Destructuring assignment extracts named exports
     */
    const { marked } = await import("marked");

    /**
     * Markdown Parsing and HTML Sanitization
     *
     * Transforms Markdown to HTML using marked.parse() and sanitizes
     * the result with DomSanitizer to prevent XSS attacks.
     *
     * Processing Pipeline:
     * 1. marked.parse(content): Convert Markdown to HTML
     * 2. domSanitizer.sanitize(): Remove dangerous elements/attributes
     * 3. SecurityContext.HTML: Specify HTML sanitization context
     * 4. Fallback to empty string if sanitization returns null
     *
     * marked.parse() Functionality:
     * - Converts Markdown syntax to HTML elements
     * - Handles headers, links, code blocks, lists, emphasis
     * - Supports GitHub Flavored Markdown extensions
     * - Configurable with custom renderers and options
     *
     * DomSanitizer.sanitize() Security:
     * - Removes <script> tags and javascript: URLs
     * - Strips event handlers (onclick, onload, etc.)
     * - Validates href and src attributes
     * - Filters dangerous CSS properties
     * - Preserves safe HTML structure and content
     *
     * SecurityContext.HTML Implications:
     * - Specific to HTML content sanitization
     * - More permissive than NONE context
     * - Allows safe HTML tags and attributes
     * - Blocks known XSS vectors
     *
     * Markdown Processing Examples:
     *
     * Headers and Emphasis:
     * ```markdown
     * # Title          → <h1>Title</h1>
     * **bold**         → <strong>bold</strong>
     * *italic*         → <em>italic</em>
     * ```
     *
     * Links and Images:
     * ```markdown
     * [text](url)      → <a href="url">text</a>
     * ![alt](img.jpg)  → <img src="img.jpg" alt="alt">
     * ```
     *
     * Code and Lists:
     * ```markdown
     * `code`           → <code>code</code>
     * - item           → <ul><li>item</li></ul>
     * ```
     *
     * Security Sanitization Examples:
     *
     * Script Removal:
     * ```html
     * Input:  <script>alert('xss')</script>
     * Output: (removed completely)
     * ```
     *
     * Event Handler Removal:
     * ```html
     * Input:  <div onclick="malicious()">content</div>
     * Output: <div>content</div>
     * ```
     *
     * URL Validation:
     * ```html
     * Input:  <a href="javascript:alert('xss')">link</a>
     * Output: <a>link</a>  // href removed
     * ```
     *
     * Fallback Handling:
     * - sanitize() returns null for completely unsafe content
     * - || "" provides empty string fallback
     * - Prevents template errors with null values
     * - Graceful handling of edge cases
     *
     * Performance Optimization Opportunities:
     * - Memoization for repeated content
     * - Background processing for large content
     * - Incremental parsing for live editing
     * - Debounced transformation for user input
     *
     * Error Handling Enhancements:
     * ```typescript
     * try {
     *   const html = marked.parse(content);
     *   return this.domSanitizer.sanitize(SecurityContext.HTML, html) || '';
     * } catch (error) {
     *   console.error('Markdown parsing error:', error);
     *   return content; // Fallback to original text
     * }
     * ```
     *
     * Learning Notes:
     * - marked.parse() is synchronous after library loads
     * - Sanitization is essential for user-generated content
     * - Null coalescing (||) handles sanitizer edge cases
     * - HTML context allows rich formatting while maintaining security
     */
    return (
      this.domSanitizer.sanitize(SecurityContext.HTML, marked.parse(content)) ||
      ""
    );
  }
}
