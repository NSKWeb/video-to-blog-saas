export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* AdSense Placement: In-article Ad (Rectangle 300x250) - Can be placed here for above-the-fold content */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Transform Your Videos Into Blog Posts
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Upload a video, get AI-powered transcription and professionally
            written blog content in minutes
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-6">Upload Your Video</h3>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="video-url"
                className="block text-sm font-medium mb-2"
              >
                Video URL
              </label>
              <input
                type="url"
                id="video-url"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Generate Blog Post
            </button>
          </div>
        </section>

        {/* AdSense Placement: In-feed Ad - Can be placed between content sections */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold mb-3">1. Upload Video</h4>
            <p className="text-gray-600">
              Paste a video URL from YouTube or other platforms
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold mb-3">2. AI Processing</h4>
            <p className="text-gray-600">
              Our AI transcribes and transforms your video into a blog post
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold mb-3">3. Publish</h4>
            <p className="text-gray-600">
              Review, edit, and publish directly to WordPress or download
            </p>
          </div>
        </section>
        {/* AdSense Placement: Bottom Rectangle Ad (300x250) */}
      </div>
    </div>
  );
}
