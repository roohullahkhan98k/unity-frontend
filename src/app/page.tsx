import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="text-center py-24 md:py-32 bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
        <div className="max-w-[1200px] mx-auto px-5">
          <h1 className="font-bold mb-5 text-4xl md:text-5xl lg:text-6xl" style={{lineHeight:1.1}}>Welcome to Unity Social</h1>
          <p className="mb-10 text-lg md:text-xl lg:text-2xl opacity-90">Connect, share, and engage with your community in a whole new way</p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-md mx-auto">
            <Link href="/login" className="inline-block w-full py-4 px-8 rounded-[12px] text-lg font-semibold cursor-pointer transition-all duration-300 no-underline text-center bg-indigo-500 text-white shadow-md hover:bg-indigo-600 hover:-translate-y-0.5">
              Get Started
            </Link>
            <Link href="/register" className="inline-block w-full py-4 px-8 rounded-[12px] text-lg font-semibold cursor-pointer transition-all duration-300 no-underline text-center bg-[#f8f9fa] text-indigo-500 border-2 border-indigo-500 shadow-md hover:bg-indigo-500 hover:text-white">
              Sign Up
            </Link>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-5">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-5" style={{marginBottom:'20px'}}>Why Choose Unity Social?</h2>
          <p className="text-center text-lg md:text-xl text-[#666] mb-10" style={{marginBottom:'40px'}}>Experience social networking like never before with our cutting-edge features</p>
          <div className="grid gap-10 md:gap-12 mt-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 features-grid">
            <div className="text-center p-8 rounded-[12px] shadow-lg feature-card">
              <div className="text-5xl mb-5 feature-icon">🚀</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#333] feature-title">Real-time Connections</h3>
              <p className="text-[#666] leading-relaxed feature-description">Connect with friends and family instantly with our real-time messaging and live updates powered by WebSocket technology.</p>
            </div>
            <div className="text-center p-8 rounded-[12px] shadow-lg feature-card">
              <div className="text-5xl mb-5 feature-icon">🔒</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#333] feature-title">Privacy First</h3>
              <p className="text-[#666] leading-relaxed feature-description">Your privacy matters. We use advanced security measures and give you full control over your data and who can see your content.</p>
            </div>
            <div className="text-center p-8 rounded-[12px] shadow-lg feature-card">
              <div className="text-5xl mb-5 feature-icon">📱</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#333] feature-title">Mobile Optimized</h3>
              <p className="text-[#666] leading-relaxed feature-description">Access your social feed anywhere, anytime. Our responsive design ensures a perfect experience on all devices.</p>
            </div>
            <div className="text-center p-8 rounded-[12px] shadow-lg feature-card">
              <div className="text-5xl mb-5 feature-icon">🎨</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#333] feature-title">Rich Media Sharing</h3>
              <p className="text-[#666] leading-relaxed feature-description">Share photos, videos, and interactive content with advanced media upload and processing capabilities.</p>
            </div>
            <div className="text-center p-8 rounded-[12px] shadow-lg feature-card">
              <div className="text-5xl mb-5 feature-icon">🔍</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#333] feature-title">Smart Discovery</h3>
              <p className="text-[#666] leading-relaxed feature-description">Discover new content and connections with our intelligent recommendation system and advanced search features.</p>
            </div>
            <div className="text-center p-8 rounded-[12px] shadow-lg feature-card">
              <div className="text-5xl mb-5 feature-icon">🌐</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#333] feature-title">Global Community</h3>
              <p className="text-[#666] leading-relaxed feature-description">Join a thriving global community of users sharing experiences, ideas, and moments from around the world.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="text-center py-16 md:py-20 bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
        <div className="max-w-[1200px] mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold mb-5" style={{marginBottom:'20px'}}>Ready to Join the Community?</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90" style={{marginBottom:'30px'}}>Start your social journey today and connect with people who matter</p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-md mx-auto">
            <Link href="/auth/register" className="inline-block w-full py-4 px-8 rounded-[12px] text-lg font-semibold cursor-pointer transition-all duration-300 no-underline text-center bg-indigo-500 text-white shadow-md hover:bg-indigo-600 hover:-translate-y-0.5">
              Create Account
            </Link>
            <Link href="/auth/login" className="inline-block w-full py-4 px-8 rounded-[12px] text-lg font-semibold cursor-pointer transition-all duration-300 no-underline text-center bg-[#f8f9fa] text-indigo-500 border-2 border-indigo-500 shadow-md hover:bg-indigo-500 hover:text-white">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
