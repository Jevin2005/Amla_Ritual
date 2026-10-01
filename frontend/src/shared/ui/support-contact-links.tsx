import { SUPPORT } from "@/shared/config/support";

export function SupportContactLinks() {
  return <><a href={SUPPORT.emailHref} className="break-all underline underline-offset-4">{SUPPORT.email}</a>{" or call "}<a href={SUPPORT.phoneHref} className="whitespace-nowrap underline underline-offset-4">{SUPPORT.phoneDisplay}</a></>;
}
