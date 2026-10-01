import ArrowIcon from "@/components/ArrowIcon";
import EnquiryForm from "@/components/EnquiryForm";
import { SITE } from "@/lib/site";

export default function EnquirySection({
  projects,
  defaultProjectId = "",
  title = "Begin the conversation.",
  intro = "Tell us what you are looking for. A member of our sales team will reply within one working day.",
}) {
  const contacts = [
    { label: "Call us directly", value: SITE.phone, href: SITE.phoneLink },
    { label: "WhatsApp our team", value: SITE.whatsapp, href: SITE.whatsappLink },
    { label: "Schedule a site visit", value: "Choose a time in the form", href: "#enquiry-form" },
  ];

  return (
    <section id="enquiry" className="bg-surface">
      <div className="mx-auto grid w-full max-w-[1400px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-10 lg:py-28">
        <div>
          <h2 className="heading text-[40px] sm:text-5xl lg:text-[56px]">{title}</h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/90">{intro}</p>

          <ul className="mt-12 border-t border-line/60">
            {contacts.map((contact) => (
              <li key={contact.label} className="border-b border-line/60">
                <a
                  href={contact.href}
                  className="group flex items-start justify-between gap-4 py-6 transition-colors hover:text-muted"
                >
                  <span className="text-[16px] leading-snug">
                    {contact.label}
                    <br />
                    <span className="text-white/90">{contact.value}</span>
                  </span>
                  <ArrowIcon className="mt-1 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div id="enquiry-form" className="lg:pt-2">
          <EnquiryForm projects={projects} defaultProjectId={defaultProjectId} />
        </div>
      </div>
    </section>
  );
}
