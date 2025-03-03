/**
 * Database relations configuration
 * This file exports all relations between tables in the schema
 */

import { initializeRelations } from './init-relations';

// Initialize and export all relations
const {
  usersRelations,
  userPreferencesRelations,
  userCreditsRelations,
  creditTransactionsRelations,
  conversationsRelations,
  messagesRelations,
  citationsRelations
} = initializeRelations();

// Export all relations
export {
  usersRelations,
  userPreferencesRelations,
  userCreditsRelations,
  creditTransactionsRelations,
  conversationsRelations,
  messagesRelations,
  citationsRelations
}; 