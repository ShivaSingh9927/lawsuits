"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image"; // Add this line

export function Footer() {
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };
  return (
    <footer className="border-t border-border bg-[#FDFCFB] pt-24 pb-12">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 sm:px-12 sm:py-24 lg:px-32">
        <div className="grid grid-cols-1 gap-12 sm:gap-16 lg:grid-cols-4">
          <div className="space-y-8">
            {/* Replacing h3 with Logo */}
            <Link href="/" className="inline-block group relative">
              <Image
                src="/TDO-black-logo-transp-01.webp"
                alt="THE DRESS OUTFITTERS"
                width={180}
                height={50}
                className="h-12 md:h-16 w-auto" // Removed 'invert' because footer is light
              />
              <div className="absolute -bottom-2 left-0 h-[3px] w-0 bg-black transition-all duration-500 group-hover:w-full" />
            </Link>
            <p className="max-w-xs text-base font-light leading-relaxed text-black/70">
              Crafting the finest legal attire for the modern advocate. Precision,
              tradition, and excellence in every stitch.
            </p>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-black">Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 text-accent-yellow/60" />
                <span className="text-base font-light text-muted-foreground">thedressoutfitters@gmail.com</span>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="mt-1 h-5 w-5 text-accent-yellow/60" />
                <span className="text-base font-light text-muted-foreground">+91 7777955002</span>
              </li>
              <li className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-black/40 shrink-0" />
                <span className="text-base font-light text-black/70 flex flex-col">
                  <span>Punjab and Haryana High Court</span>
                  <span>Sector 1, Chandigarh, Punjab - 160001</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-black">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: "Collection", href: "/shop" },
                { name: "About Us", href: "/about" },
                { name: "Contact Us", href: "/contact" },
                { name: "Your Orders", href: "/orders" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-base font-light text-black/70 transition-colors hover:text-black">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-black">Newsletter</h4>
            <p className="mb-8 text-base font-light text-muted-foreground/80">
              Join our mailing list for private collection launches.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <Input
                type="email"
                required
                placeholder="Excellence@Advocate.com"
                className="h-14 rounded-none border-border/60 bg-transparent text-base placeholder:text-muted-foreground/30 focus-visible:ring-accent-yellow"
              />
              <Button
                type="submit"
                disabled={subscribed}
                className="h-14 rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-xs font-semibold"
              >
                {subscribed ? "Welcome" : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-24 bg-border/40" />

        <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground/60 font-medium text-center md:text-left">
            © {new Date().getFullYear()} THE DRESS OUTFITTERS. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">
            <div className="flex gap-8">
              <Link href="#" className="hover:text-accent-yellow transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-accent-yellow transition-colors">Terms</Link>
            </div>
            <div className="flex gap-6 border-t sm:border-t-0 sm:border-l border-border/20 pt-8 sm:pt-0 sm:pl-12">
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
