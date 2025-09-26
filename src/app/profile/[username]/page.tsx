import WalletBalance from "../../components/WalletBalance";
import PostsSection from "./components/PostsSection";
import ProfileCard from "./components/ProfileCard";

export default function ProfileDashboard() {
  return (
    <main className="p-2 sm:p-3 md:p-4 w-full max-w-6xl mx-auto h-full">
      {/* Top row - Profile and Wallet Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <ProfileCard />
        <div className="lg:col-span-2">
          <WalletBalance />
        </div>
      </div>
      
      {/* Bottom section - Your Posts */}
      <PostsSection />
    </main>
  );
} 