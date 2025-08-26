import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { HeaderSection } from "../../../../components/sections/header-section"
import { ProductDetailContent } from "../../../../components/sections/product-detail-content"
import { PageLayout } from "../../../../components/layout/page-layout"
import { ProductsGridPage } from "../../../../components/products-grid-page"
import { ProductsSidebar } from "../../../../components/products-sidebar"
import { Footer } from "components/footer"
import { FooterSection } from "components/sections/footer-section"


interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <PageLayout>
      <HeaderSection />
      <ProductDetailContent productId={params.id} />
      <FooterSection  />
    </PageLayout>
  );
}

