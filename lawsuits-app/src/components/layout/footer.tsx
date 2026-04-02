"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Globe, Share2, MessageCircle } from "lucide-react";

export function Footer() {
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };
  return (
    <footer className="border-t border-border bg-[#FDFCFB] pt-24 pb-12">
      <div className="mx-auto max-w-screen-2xl px-12 py-24 lg:px-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4">
          <div className="space-y-8">
            <h3 className="font-serif text-3xl font-light tracking-[0.2em] text-foreground">
              THE DRESS OUTFITTERS<span className="text-accent-yellow">.</span>
            </h3>
            <p className="max-w-xs text-base font-light leading-relaxed text-muted-foreground/90">
              Crafting the finest legal attire for the modern advocate. Precision, 
              tradition, and excellence in every stitch.
            </p>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-accent-yellow">Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 text-accent-yellow/60" />
                <span className="text-base font-light text-muted-foreground">thedressoutfitters@gmail.com</span>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="mt-1 h-5 w-5 text-accent-yellow/60" />
                <span className="text-base font-light text-muted-foreground">+91 77779-55002</span>
              </li>
              <li className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-accent-yellow/60" />
                <span className="text-base font-light text-muted-foreground flex flex-col">
                  <span>Punjab and Haryana High Court</span>
                  <span>Chandigarh</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-accent-yellow">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: "Collection", href: "/shop" },
                { name: "Atelier", href: "/#home-fitting" },
                { name: "Heritage", href: "/shop?category=suits" },
                { name: "Contact", href: "mailto:thedressoutfitters@gmail.com" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-base font-light text-muted-foreground transition-colors hover:text-accent-yellow">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-accent-yellow">Atelier Newsletter</h4>
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
                {subscribed ? "Welcome to the Atelier" : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-24 bg-border/40" />

        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">
            © {new Date().getFullYear()} THE DRESS OUTFITTERS Atelier. All rights reserved.
          </p>
          <div className="flex gap-12 text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">
            <Link href="#" className="hover:text-accent-yellow transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-accent-yellow transition-colors">Terms</Link>
            <div className="flex gap-6">
            <Link href="https://instagram.com" target="_blank">
              <Globe className="h-5 w-5 cursor-pointer hover:text-accent-yellow transition-colors" />
            </Link>
            <Link href="https://facebook.com" target="_blank">
              <Share2 className="h-5 w-5 cursor-pointer hover:text-accent-yellow transition-colors" />
            </Link>
            <Link href="https://whatsapp.com" target="_blank">
              <MessageCircle className="h-5 w-5 cursor-pointer hover:text-accent-yellow transition-colors" />
            </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
