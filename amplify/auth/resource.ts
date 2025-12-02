import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    // Enable BOTH mechanisms to support your two user roles
    email: true,
    phone: true, 
  },
  // Define the data you need to collect per Requirement #9
  userAttributes: {
    // We specify these so Amplify provisions them in the User Pool
    givenName: {
      mutable: true,
      required: false, // Optional so Admins don't strictly need it to sign up initially
    },
    familyName: {
      mutable: true,
      required: false,
    },
    address: {
      mutable: true,
      required: false,
    },
    email: {
      mutable: true,
      required: false, // CRITICAL: Must be false so Customers can sign up with only Phone
    },
    phoneNumber: {
      mutable: true,
      required: false, // CRITICAL: Must be false so Admins can sign up with only Email
    },
  },
});
