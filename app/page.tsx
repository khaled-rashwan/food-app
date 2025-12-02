import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Kuwait Food Delivery & Catering
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fresh meals and catering packages delivered to your door
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              Register
            </Link>
          </div>
        </header>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2">Ready Meals</h3>
            <p className="text-gray-600">
              Delicious meals prepared fresh daily and delivered hot to your door
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Catering Packages</h3>
            <p className="text-gray-600">
              Perfect for events - serving 15, 25, or 50+ guests
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Track your order in real-time from kitchen to your doorstep
            </p>
          </div>
        </section>

        {/* Service Areas */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Serving All Kuwait</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We deliver across all areas of Kuwait. Authentic flavors, premium quality, 
            and exceptional service - that's our promise to you.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center bg-orange-500 text-white rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-lg mb-6">
            Sign up now and enjoy exclusive offers on your first order
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-orange-500 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p>© 2025 Kuwait Food Delivery & Catering. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/admin/login" className="text-gray-400 hover:text-gray-600 text-sm">
              Staff Login
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
