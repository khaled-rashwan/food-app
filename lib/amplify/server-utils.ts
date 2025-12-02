import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import { cookies } from "next/headers";
import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";

/**
 * Server-side Amplify configuration for Next.js App Router
 * Use these utilities in Server Components, Server Actions, and Route Handlers
 */

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

/**
 * Cookie-based client for Server Components and Server Actions
 * This is the main client you'll use for data operations on the server
 */
export const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});
