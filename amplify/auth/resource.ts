import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    phone: true, 
  },
  groups: ["Admin", "Kitchen", "Delivery"],
  userAttributes: {
    givenName: {
      mutable: true,
      required: false,
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
      required: false,
    },
    phoneNumber: {
      mutable: true,
      required: false,
    },
  },
});
