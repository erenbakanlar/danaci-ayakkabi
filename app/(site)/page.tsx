import { BrandHero, type HeroSlide } from "@/components/home/BrandHero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { StoreStory } from "@/components/home/StoreStory";
import { getFeaturedProducts } from "@/lib/products";

const COLLECTION_ID = "koleksiyon";

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  // Hero'da süs olarak dönen ayakkabılar: öne çıkanların şeffaf kesimleri.
  const slides: HeroSlide[] = featured.flatMap((product) =>
    product.cutout
      ? [{ id: product.id, image: product.cutout, label: product.subcategory }]
      : [],
  );

  return (
    <>
      <BrandHero slides={slides} collectionId={COLLECTION_ID} />
      <FeaturedProducts products={featured} id={COLLECTION_ID} />
      <StoreStory />
    </>
  );
}
