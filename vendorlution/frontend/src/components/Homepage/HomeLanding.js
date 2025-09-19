import Hero from "./Hero";
import CategoryScroller from "./CategoryScroller";
import ProductGridSection from "./ProductGridSection";
import FeaturedVendors from "./FeaturedVendors";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import FloatingChatButton from "./FloatingChatButton";
import "./homepage.css";

function HomeLanding() {
  return (
    <main className="mt-4">
      <div className="container">
        <Hero />
        <CategoryScroller />
        <ProductGridSection title="New Arrivals" linkTo="/products" count={8} />
        <ProductGridSection title="Popular Products" linkTo="/products" count={8} />
        <FeaturedVendors />
        <HowItWorks />
        <Testimonials />
      </div>
      <FloatingChatButton />
    </main>
  );
}

export default HomeLanding;
