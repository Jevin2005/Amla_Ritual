import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";

export function SiteFooter({ newsletter }: { newsletter: ReactNode }) {
  return (
    <footer className="site-footer" id="newsletter">
      <div className="site-footer__newsletter">
        <div>
          <p className="eyebrow eyebrow--light">A quieter kind of beauty note</p>
          <h2>Rituals worth returning to.</h2>
        </div>
        <div>
          <p>Ingredient stories, preparation guides and thoughtful new arrivals.</p>
          {newsletter}
        </div>
      </div>
      <div className="site-footer__links">
        <div className="site-footer__brand">
          <BrandMark />
          <p>Traditional Indian botanicals, translated into clear and considered care.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <Link href="/shop">All botanicals</Link>
          <Link href="/shop?goal=Cleanse">Cleansing rituals</Link>
          <Link href="/shop?goal=Softness+%2B+Shine">Softness + shine</Link>
          <Link href="/shop?goal=Botanical+Colour">Botanical colour</Link>
        </div>
        <div>
          <h3>Discover</h3>
          <Link href="/rituals">Build your ritual</Link>
          <Link href="/our-story">Our story</Link>
          <Link href="/#ingredient-standards">Ingredient standards</Link>
          <Link href="/#faq">Frequently asked</Link>
        </div>
        <div>
          <h3>Care</h3>
          <Link href="/track-order">Track an order</Link>
          <Link href="/shipping-returns">Shipping + returns</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} NatureMist</span>
        <span>Rooted in Ayurveda. Made for modern rituals.</span>
        <span>India · Worldwide vision</span>
      </div>
    </footer>
  );
}
