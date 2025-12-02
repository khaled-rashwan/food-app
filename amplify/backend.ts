import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';

/**
 * Kuwait Food Delivery & Catering Platform
 * Amplify Gen 2 Backend Configuration
 */
const backend = defineBackend({
  auth,
  data,
  storage,
});

// Add admin group to auth
const { cfnUserPool } = backend.auth.resources.cfnResources;

// Cognito groups for role-based access control
backend.auth.resources.groups = {
  admins: backend.auth.resources.userPool.addGroup("admins", {
    description: "Admin users with full access",
  }),
  kitchen: backend.auth.resources.userPool.addGroup("kitchen", {
    description: "Kitchen staff - view and update order preparation",
  }),
  delivery: backend.auth.resources.userPool.addGroup("delivery", {
    description: "Delivery team - view and update delivery status",
  }),
};
