import Link from "next/link";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { BrandMark } from "./brand-mark";

const footerHeadingClass =
  "m-0 mb-[18px] text-[0.63rem] tracking-[0.14em] text-[var(--paper)] uppercase";
const footerLinkClass =
  "my-[5px] w-max text-[0.77rem] text-[rgba(255,255,255,0.56)] transition-[color,transform] duration-200 ease-[ease] hover:text-[var(--paper)] hover:[transform:translateX(3px)]";

export function SiteFooter() {
  return (
    <footer
      className="bg-[var(--forest)] px-[clamp(25px,6vw,96px)] pt-[clamp(75px,8vw,120px)] pb-[25px] text-[rgba(255,255,255,0.72)] max-[680px]:px-5"
      id="newsletter"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_0.75fr] gap-[8vw] border-b border-[rgba(255,255,255,0.16)] pb-[70px] max-[900px]:grid-cols-[1fr]">
        <div>
          <p className="m-0 mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[#c8d88e] uppercase">
            A quieter kind of beauty note
          </p>
          <h2 className="m-0 max-w-[700px] font-serif text-[clamp(3.2rem,5vw,6.5rem)] leading-[0.96] font-normal tracking-[-0.055em] text-[var(--paper)] max-[680px]:text-[clamp(3rem,15vw,4.8rem)]">
            Rituals worth returning to.
          </h2>
        </div>
        <div className="self-end">
          <p className="max-w-[460px]">
            Ingredient stories, preparation guides and thoughtful new arrivals.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1400px] grid-cols-[1.6fr_repeat(3,0.7fr)] gap-[45px] py-[65px] max-[900px]:grid-cols-[1.5fr_repeat(3,1fr)] max-[680px]:grid-cols-[1fr_1fr]">
        <div className="max-[680px]:col-span-full">
          <BrandMark variant="footer" />
          <p className="mt-[22px] max-w-[350px] text-[rgba(255,255,255,0.52)]">
            Traditional Indian botanicals, translated into clear and considered care.
          </p>
        </div>
        <div className="flex flex-col">
          <h3 className={footerHeadingClass}>Shop</h3>
          <Link className={footerLinkClass} href="/shop">
            All botanicals
          </Link>
          <Link className={footerLinkClass} href="/shop?goal=Cleanse">
            Cleansing rituals
          </Link>
          <Link className={footerLinkClass} href="/shop?goal=Softness+%2B+Shine">
            Softness + shine
          </Link>
          <Link className={footerLinkClass} href="/shop?goal=Botanical+Colour">
            Botanical colour
          </Link>
        </div>
        <div className="flex flex-col">
          <h3 className={footerHeadingClass}>Discover</h3>
          <Link className={footerLinkClass} href="/rituals">
            Build your ritual
          </Link>
          <Link className={footerLinkClass} href="/our-story">
            Our story
          </Link>
          <Link className={footerLinkClass} href="/#ingredient-standards">
            Ingredient standards
          </Link>
          <Link className={footerLinkClass} href="/#faq">
            Frequently asked
          </Link>
        </div>
        <div className="flex flex-col">
          <h3 className={footerHeadingClass}>Care</h3>
          <Link className={footerLinkClass} href="/track-order">
            Track an order
          </Link>
          <Link className={footerLinkClass} href="/shipping-returns">
            Shipping + returns
          </Link>
          <Link className={footerLinkClass} href="/privacy">
            Privacy
          </Link>
          <Link className={footerLinkClass} href="/terms">
            Terms
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1400px] justify-between border-t border-[rgba(255,255,255,0.12)] pt-[22px] text-[0.54rem] tracking-[0.11em] text-[rgba(255,255,255,0.38)] uppercase max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-2">
        <span>© {new Date().getFullYear()} NatureMist</span>
        <span>Rooted in Ayurveda. Made for modern rituals.</span>
        <span>India · Worldwide vision</span>
      </div>
    </footer>
  );
}
