import { CinematicSequence } from "@/components/cinematic/CinematicSequence";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { PopularProducts } from "@/components/home/PopularProducts";
import { BundleBuilder } from "@/components/home/BundleBuilder";
import { BrandStory } from "@/components/home/BrandStory";
import { Faq } from "@/components/home/Faq";
import { EmailSignup } from "@/components/home/EmailSignup";

export default function Home() {
  return (
    <>
      <CinematicSequence />
      <div id="after-cinematic" className="scroll-mt-[var(--header-h)]" />
      <ShopByCategory />
      <PopularProducts />
      <BundleBuilder />
      <BrandStory />
      <Faq />
      <EmailSignup />
    </>
  );
}
