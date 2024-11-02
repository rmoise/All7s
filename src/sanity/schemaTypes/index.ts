import { defineType, defineField } from 'sanity'

// Import your schema types
import author from './authorType'
import category from './categoryType'
// ... other schema imports

// Define the schema configuration
export const schema = {
  types: [
    author,
    category,
    // ... other schema types
  ],
}
