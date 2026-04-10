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
    <footer className="border-t border-border bg-[#FDFCFB] pt-16 pb-12">
      <div className="mx-auto max-w-screen-2xl px-6 py-8 sm:px-12 sm:py-16 lg:px-32">
        <div className="grid grid-cols-1 gap-12 sm:gap-16 lg:grid-cols-3">
          <div className="space-y-8">
            <Link href="/" className="inline-block group relative">
              <Image
                src="/TDO-black-logo-transp-01.webp"
                alt="THE DRESS OUTFITTERS"
                width={200}
                height={60}
                className="h-14 md:h-20 w-auto"
              />
              <div className="absolute -bottom-2 left-0 h-[3px] w-0 bg-black transition-all duration-500 group-hover:w-full" />
            </Link>
            <p className="max-w-xs text-base font-light leading-relaxed text-black/80">
              Crafting the finest legal attire for the modern advocate. Precision,
              tradition, and excellence in every stitch.
            </p>
          </div>

          <div>
            <h4 className="mb-8 text-base font-bold uppercase tracking-[0.3em] text-black">Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <Mail className="mt-1 h-6 w-6 text-accent-yellow" />
                <span className="text-base font-light text-zinc-700">thedressoutfitters@gmail.com</span>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="mt-1 h-6 w-6 text-accent-yellow" />
                <span className="text-base font-light text-zinc-700">+91 7777955002</span>
              </li>
              <li className="flex items-start gap-4">
                <MapPin className="mt-1 h-6 w-6 text-zinc-400 shrink-0" />
                <span className="text-base font-light text-zinc-700 flex flex-col">
                  <span className="font-medium text-black">Punjab and Haryana High Court</span>
                  <span>Sector 1, Chandigarh, Punjab - 160001</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-base font-bold uppercase tracking-[0.3em] text-black">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: "Collection", href: "/shop" },
                { name: "About Us", href: "/about" },
                { name: "Contact Us", href: "/contact" },
                { name: "Your Orders", href: "/orders" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-base font-light text-zinc-600 transition-colors hover:text-black">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-16 bg-border/40" />

        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-zinc-500 font-medium text-center md:text-left">
            © {new Date().getFullYear()} THE DRESS OUTFITTERS. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-10 text-xs sm:text-sm uppercase tracking-widest text-zinc-500 font-medium">
            <div className="flex gap-10">
              <Link href="#" className="hover:text-accent-yellow transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-accent-yellow transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
