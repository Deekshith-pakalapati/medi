const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// This middleware will enforce that the request has a valid Clerk JWT.
const requireAuth = ClerkExpressRequireAuth({});

module.exports = {
  requireAuth
};
