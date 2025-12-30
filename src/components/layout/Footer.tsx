"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Github, Twitter, Linkedin, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "../../../i18n/routing";
import { useTranslations } from 'next-intl';

interface FooterProps {
  className?: string;
}

const socialLinks = [
  { icon: Github, href: siteConfig.social.github, label: "GitHub" },
  { icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
  { icon: Twitter, href: siteConfig.social.twitter, label: "Twitter" },
  { icon: Youtube, href: siteConfig.social.youtube, label: "YouTube" },
  { icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
  { icon: Linkedin, href: siteConfig.social.linkedin, label: "LinkedIn" },
];

export function Footer({ className }: FooterProps) {
  const t = useTranslations('footer.sections');

  const footerLinks = {
    product: {
      title: t('product'),
      links: siteConfig.links.product,
    },
    tools: {
      title: t('tools'),
      links: siteConfig.links.tools,
    },
    resources: {
      title: t('resources'),
      links: siteConfig.links.resources,
    },
    community: {
      title: t('community'),
      links: siteConfig.links.community,
    },
    contact: {
      title: t('contact'),
      links: siteConfig.links.contact,
    },
    legal: {
      title: t('legal'),
      links: siteConfig.links.legal,
    },
  };

  return (
    <motion.footer
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className={cn(
        "border-t border-border bg-background",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16 lg:px-8">
        {/* Navigation Links */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-2 gap-6 md:gap-8 md:grid-cols-3 lg:grid-cols-6 mb-12 md:mb-16 lg:mb-20"
        >
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <div className="font-medium text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                {section.title}
              </div>
              <ul className="space-y-2 md:space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-foreground text-xs md:text-sm transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Large Brand Name */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden py-8 md:py-12 lg:py-16 xl:py-20"
        >
          <div className="text-[4rem] sm:text-[6rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem] font-bold text-foreground/5 leading-none tracking-tighter text-center select-none">
            {siteConfig.name}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 pt-6 md:pt-8 border-t border-border"
        >
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            © {siteConfig.copyright.year} {siteConfig.fullName}. {siteConfig.copyright.text}
          </p>

          {/* Social Links */}
          <div className="flex gap-3 md:gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label={social.label}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
