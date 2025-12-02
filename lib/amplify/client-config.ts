import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

/**
 * Client-side Amplify configuration
 * Use this in client components
 */
export function configureAmplifyClient() {
  Amplify.configure(outputs, {
    ssr: true,
  });
}
