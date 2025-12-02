import { defineStorage } from "@aws-amplify/backend";

/**
 * Storage configuration for product images, catering package images, etc.
 */
export const storage = defineStorage({
  name: "foodAppStorage",
  access: (allow) => ({
    // Public product images - anyone can read
    "public/products/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
      allow.groups(["Admin"]).to(["read", "write", "delete"]),
    ],
    // Public catering images
    "public/catering/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
      allow.groups(["Admin"]).to(["read", "write", "delete"]),
    ],
    // Public category images
    "public/categories/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
      allow.groups(["Admin"]).to(["read", "write", "delete"]),
    ],
    // User profile pictures (protected by user identity)
    "protected/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});
