"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Link from "next/link";

// Configure Amplify for client-side auth
Amplify.configure(outputs, { ssr: true });

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    // Check if already authenticated and redirect to dashboard
    checkAuthAndRedirect();
  }, []);

  async function checkAuthAndRedirect() {
    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        router.push(`/${locale}/admin/dashboard`);
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600">
            Sign in to access the dashboard
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <Authenticator
            loginMechanisms={["email"]}
            signUpAttributes={[]}
            hideSignUp={true}
            formFields={{
              signIn: {
                username: {
                  label: "Email",
                  placeholder: "Enter your email",
                },
                password: {
                  label: "Password",
                  placeholder: "Enter your password",
                },
              },
            }}
          >
            {({ signOut, user }) => {
              // Redirect to dashboard when authenticated
              if (user) {
                router.push(`/${locale}/admin/dashboard`);
              }
              return <div></div>;
            }}
          </Authenticator>
        </div>

        <div className="text-center mt-6">
          <Link
            href={`/${locale}`}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
