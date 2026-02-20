import Mockup from "./Components/Mockup";
import { CardHoverEffectDemo } from "./Components/Cardhover";
import { Testimonials } from "./Components/Testimonals";
import Visionandmision from "./Components/Visionandmision";
import { Suspense } from "react";
// import CoreValues2 from "./Components/Corevalue2";
import Whychooseus from "./Components/Whychooseus";
import GlassButtonDemo from "./Components/GlassButtonDemo";
import { Metadata } from "next";
// import TeamCarousel from "./Components/Team";

export const metadata: Metadata = {
  title: "Home - Stock Market Trading & Investment Platform",
  description: "Stockology is India's leading stock broker offering zero brokerage trading, free demat account, mutual funds, IPO investments. Start investing with the best trading platform.",
  keywords: ["stock market India", "online trading", "zero brokerage", "demat account", "mutual funds", "IPO investment", "best stock broker"],
  openGraph: {
    title: "Stockology - Best Stock Broker in India | Zero Brokerage",
    description: "Trade smarter with Stockology. Zero brokerage charges, free demat account, expert market insights.",
    images: ["/stklogo.png"],
  },
};

import GatewaySection from "./Components/GatewaySection";
import StockologyCoreValues from "./Components/StockologyCoreValues";
import MobileOnline from "./Components/Mobile&Online";
import PopupModal from "./Components/PopupModal";
import StockDashboard from "./Components/StockDashboard";

export default function Home() {
  return (
    <>
      <PopupModal />
      <Mockup />

      {/* Live Stock Market Dashboard */}
      <section id="live-market-data" className="pt-6 pb-16 px-4 md:px-8 md:pt-8 lg:px-16 lg:pt-10 max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <p className="mx-auto inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Live
          </p>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-5xl">
            Market <span className="text-emerald-600">Data</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
            Data is delayed by a few seconds. For real-time updates, please use our app.
          </p>
          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500" />
        </div>
        <Suspense fallback={<div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading market dashboard...</div>}>
          <StockDashboard />
        </Suspense>
      </section>

      <Whychooseus />

      <CardHoverEffectDemo />
      <GatewaySection />
      <Visionandmision />
      {/* <GlassButtonDemo /> */}

      {/* <StockologyCoreValues /> */}
      {/* <MobileOnline /> */}

      {/* <TeamCarousel /> */}
      {/* <Testimonials /> */}

    </>
  );
}
