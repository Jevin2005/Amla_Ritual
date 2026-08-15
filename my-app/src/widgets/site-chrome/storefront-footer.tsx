import { NewsletterForm } from "@/features/newsletter/components/newsletter-form";
import { SiteFooter as SiteFooterView } from "@/shared/layout/site-footer";

export function SiteFooter() {
  return <SiteFooterView newsletter={<NewsletterForm />} />;
}
