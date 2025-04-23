/**
 * Custom Handlebars Helpers
 */
export const handlebarsHelpers = {
  /**
   * Equality helper - checks if two values are equal
   * Usage: {{#if (eq value1 value2)}} ... {{/if}}
   */
  eq: function(a: any, b: any) {
    return a === b;
  },
  
  /**
   * Format date helper
   * Usage: {{formatDate date}}
   */
  formatDate: function(date: Date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  /**
   * Format currency helper
   * Usage: {{formatCurrency amount}}
   */
  formatCurrency: function(amount: number) {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  },
  
  /**
   * Join array helper
   * Usage: {{join array ", "}}
   */
  join: function(array: any[], separator: string) {
    if (!Array.isArray(array)) return '';
    return array.join(separator);
  },
  
  /**
   * Truncate string helper
   * Usage: {{truncate string 100}}
   */
  truncate: function(str: string, length: number) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }
}; 