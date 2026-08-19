import Link from "next/link";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { BrandMark } from "./brand-mark";

const footerHeadingClass =
  "m-0 mb-[18px] text-[0.7rem] font-bold tracking-[0.14em] text-[var(--amla)] uppercase";
const footerLinkClass =
  "inline-flex min-h-11 w-fit max-w-full items-center text-[0.82rem] leading-[1.35] text-white/72 transition-[color,transform] duration-200 ease-[ease] hover:text-[var(--paper)] hover:[transform:translateX(4px)]";

export function SiteFooter() {
  return (
    <footer
      className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(183,212,90,0.12),transparent_28%),linear-gradient(145deg,var(--forest),var(--forest-dark))] px-[clamp(25px,6vw,96px)] pb-[25px] pt-[clamp(75px,8vw,120px)] text-white/76 before:pointer-events-none before:absolute before:inset-0 before:-z-[1] before:bg-[radial-gradient(rgba(255,255,255,0.16)_0.5px,transparent_0.5px)] before:bg-size-[9px_9px] before:opacity-15 before:[mask-image:linear-gradient(115deg,black,transparent_66%)] before:content-[''] max-[680px]:pr-[max(20px,env(safe-area-inset-right))] max-[680px]:pb-[calc(25px+env(safe-area-inset-bottom))] max-[680px]:pl-[max(20px,env(safe-area-inset-left))]"
      id="newsletter"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_0.75fr] gap-[8vw] border-b border-white/18 pb-[70px] max-[900px]:grid-cols-1 max-[900px]:gap-10">
        <div>
          <p className="m-0 mb-4 text-[0.7rem] font-bold uppercase leading-[1.3] tracking-[0.18em] text-[var(--amla)]">
            A quieter kind of beauty note
          </p>
          <h2 className="m-0 max-w-[700px] font-serif text-[clamp(3.2rem,5vw,6.25rem)] font-normal leading-[0.94] tracking-[-0.045em] text-[var(--paper)] max-[680px]:text-[clamp(2.8rem,14vw,4.5rem)]">
            Rituals worth returning to.
          </h2>
        </div>
        <div className="self-end">
          <p className="max-w-[460px] text-[0.98rem] leading-[1.7] text-white/72">
            Ingredient stories, preparation guides and thoughtful new arrivals.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1.6fr_repeat(3,0.7fr)] gap-[45px] py-[65px] max-[900px]:grid-cols-[1.35fr_repeat(3,1fr)] max-[680px]:grid-cols-[1fr_1fr] max-[680px]:gap-x-6 max-[680px]:gap-y-10">
        <div className="max-[680px]:col-span-full">
          <Link
            className="inline-block"
            href="/"
            aria-label="NatureMist home"
          >
            <BrandMark variant="footer" />
          </Link>
          <p className="mt-[22px] max-w-[350px] text-[0.92rem] leading-[1.7] text-white/68">
            Traditional Indian botanicals, translated into clear and considered care.
          </p>
        </div>
        <nav className="flex flex-col" aria-label="Shop links">
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
        </nav>
        <nav className="flex flex-col" aria-label="Discover links">
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
        </nav>
        <nav className="flex flex-col" aria-label="Customer care links">
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
        </nav>
      </div>
      <div className="mx-auto flex max-w-[1440px] justify-between border-t border-white/16 pt-[22px] text-[0.62rem] tracking-[0.1em] text-white/68 uppercase max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-2">
        <span>© {new Date().getFullYear()} NatureMist</span>
        <span>Rooted in Ayurveda. Made for modern rituals.</span>
        <span>India · Worldwide vision</span>
      </div>
    </footer>
  );
}
