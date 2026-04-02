"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white/90">
      <div className="mx-auto max-w-7xl px-8 py-24 lg:px-12">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-light tracking-[0.2em] text-white">
              LAWSUITS<span className="text-accent-yellow">.</span>
            </h3>
            <p className="max-w-xs text-sm font-light leading-relaxed text-white/50">
              Defining the apex of professional attire for the modern advocate. 
              Excellence in every stitch, power in every profile.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-accent-yellow/80">
              Contact Information
            </h4>
            <ul className="mt-8 space-y-4 text-xs font-light tracking-wide text-white/40">
              <li>
                <a href="mailto:thedressoutfitters@gmail.com" className="hover:text-accent-yellow transition-colors">
                  thedressoutfitters@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+917777955002" className="hover:text-accent-yellow transition-colors">
                  +91 77779-55002
                </a>
              </li>
              <li className="leading-relaxed">
                Punjab and Haryana High Court,<br />
                Chandigarh
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-accent-yellow/80">
              The Experience
            </h4>
            <ul className="mt-8 space-y-4">
              {["Shipping & Logistics", "Privacy Matters", "Terms of Use", "FAQ"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-xs font-light tracking-wide text-white/40 transition-colors hover:text-accent-yellow"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.4em] text-accent-yellow/80">
                The Inner Circle
              </h4>
              <p className="text-xs font-light text-white/50 leading-relaxed">
                Receive exclusive invitations to collection <br /> launches and atelier events.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="chambers@professional.com"
                className="h-12 border-0 border-b border-white/10 bg-transparent px-0 text-sm focus-visible:ring-0 placeholder:text-white/20"
              />
              <button className="group mt-2 flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-white transition-opacity hover:opacity-80">
                Subscribe
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-2">→</span>
              </button>
            </div>
          </div>
        </div>

        <Separator className="my-16 bg-white/5" />

        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
            &copy; {new Date().getFullYear()} LAWSUITS Atelier. All rights reserved.
          </p>
          <div className="flex gap-8">
            {["Instagram", "LinkedIn", "Twitter"].map(
              (item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-[10px] uppercase tracking-[0.2em] text-white/20 transition-colors hover:text-accent-yellow"
                >
                  {item}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
