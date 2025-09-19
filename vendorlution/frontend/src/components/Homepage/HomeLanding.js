import Hero from "./Hero";
import CategoryScroller from "./CategoryScroller";
import ProductGridSection from "./ProductGridSection";
import FeaturedVendors from "./FeaturedVendors";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import FloatingChatButton from "./FloatingChatButton";

function HomeLanding() {
  return (
    <>
      <Hero />
      <div className="container py-4">
        <CategoryScroller />

        {/* New Arrivals */}
        <ProductGridSection
          title="New Arrivals"
          linkTo="/products/new"
          count={8}
          variant="new"
        />

        {/* Popular Products */}
        <ProductGridSection
          title="Popular Products"
          linkTo="/products/popular"
          count={8}
          variant="popular"
        />

        {/* Featured Vendors */}
        <FeaturedVendors />

        <HowItWorks />
        <Testimonials />
      </div>
      <FloatingChatButton />
    </>
  );
}

export default HomeLanding;
