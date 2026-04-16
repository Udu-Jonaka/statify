// app/(marketing)/layout.js
// Clean, full-page layout for landing page and FAQ.
// No sidebar or persistent chrome.

import Footer from "@/components/Footer";

export default function MarketingLayout({ children }) {
  return (
    <div className="marketing-layout">
      {children}
      <Footer />
    </div>
  );
}
