"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

// Configure Amplify for client-side auth
Amplify.configure(outputs, { ssr: true });

export default function AdminDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const session = await fetchAuthSession();
      
      if (!session.tokens) {
        router.push("/admin/login");
        return;
      }

      // Get user email and groups from JWT token
      const idToken = session.tokens.idToken;
      if (idToken) {
        const payload = idToken.payload;
        setUserEmail(payload.email as string || "");
        setUserGroups((payload["cognito:groups"] as string[]) || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/admin/login");
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/admin/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold">Email:</span> {userEmail}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Roles:</span>{" "}
              {userGroups.length > 0 ? userGroups.join(", ") : "No groups assigned"}
            </p>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Orders */}
          {(userGroups.includes("Admin") || userGroups.includes("Kitchen") || userGroups.includes("Delivery")) && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Orders</h3>
              <p className="text-gray-600 mb-4">
                View and manage customer orders
              </p>
              <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                View Orders
              </button>
            </div>
          )}

          {/* Products */}
          {userGroups.includes("Admin") && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">Products</h3>
              <p className="text-gray-600 mb-4">
                Manage menu items and catering packages
              </p>
              <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                Manage Products
              </button>
            </div>
          )}

          {/* Customers */}
          {userGroups.includes("Admin") && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Customers</h3>
              <p className="text-gray-600 mb-4">
                View customer profiles and history
              </p>
              <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                View Customers
              </button>
            </div>
          )}

          {/* Kitchen Display */}
          {(userGroups.includes("Admin") || userGroups.includes("Kitchen")) && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-semibold mb-2">Kitchen Display</h3>
              <p className="text-gray-600 mb-4">
                Live order queue and preparation
              </p>
              <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                Open Kitchen
              </button>
            </div>
          )}

          {/* Delivery */}
          {(userGroups.includes("Admin") || userGroups.includes("Delivery")) && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Delivery</h3>
              <p className="text-gray-600 mb-4">
                Manage deliveries and driver assignment
              </p>
              <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                View Deliveries
              </button>
            </div>
          )}

          {/* Reports */}
          {userGroups.includes("Admin") && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Reports</h3>
              <p className="text-gray-600 mb-4">
                Sales analytics and insights
              </p>
              <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                View Reports
              </button>
            </div>
          )}
        </div>

        {/* No Access Warning */}
        {userGroups.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">
              No Admin Access
            </p>
            <p className="text-yellow-700">
              Your account is not assigned to any admin groups. Please contact an administrator.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
