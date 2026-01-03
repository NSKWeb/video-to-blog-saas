import { VideoInputForm } from '@/components/VideoInputForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Your Videos Into Blog Posts
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Upload a video, get AI-powered transcription and professionally
              written blog content in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Video Input Form */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Get Started
              </h2>
              <p className="text-gray-600">
                Paste your video URL and let AI do the rest
              </p>
            </div>
            <VideoInputForm />
          </section>

          {/* AdSense Placement: In-feed Ad */}
          {/* AdSense Placement: In-feed Ad - Can be placed between content sections */}
          <div className="my-8 p-4 bg-gray-200 border-2 border-dashed border-gray-300 rounded text-center text-sm text-gray-500">
            {/* AdSense In-feed Ad Placeholder */}
            &lt;!-- AdSense In-feed Ad Placement --&gt;
          </div>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📥</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                1. Upload Video
              </h3>
              <p className="text-gray-600">
                Paste a video URL from YouTube, Vimeo, or any other platform.
                We support most video formats.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                2. AI Processing
              </h3>
              <p className="text-gray-600">
                Our AI transcribes your video and transforms it into a
                professionally written blog post with proper formatting.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                3. Publish
              </h3>
              <p className="text-gray-600">
                Review the generated blog post, make edits if needed, and
                publish directly to your WordPress site.
              </p>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">
              Why Choose Video-to-Blog?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full p-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Save Time</h4>
                  <p className="text-gray-600 text-sm">
                    Convert hours of video content into written blog posts in
                    minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full p-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">AI-Powered</h4>
                  <p className="text-gray-600 text-sm">
                    Advanced AI ensures accurate transcription and natural,
                    readable blog content
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full p-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">WordPress Integration</h4>
                  <p className="text-gray-600 text-sm">
                    Seamlessly publish to your WordPress site with one click
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full p-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">AdSense Optimized</h4>
                  <p className="text-gray-600 text-sm">
                    Blog content includes semantic HTML for optimal ad placement
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* AdSense Placement: Bottom Banner */}
          {/* AdSense Placement: Bottom Rectangle Ad (300x250) */}
          <div className="my-8 p-4 bg-gray-200 border-2 border-dashed border-gray-300 rounded text-center text-sm text-gray-500">
            {/* AdSense Bottom Banner Ad Placeholder */}
            &lt;!-- AdSense Bottom Banner Ad Placement --&gt;
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
