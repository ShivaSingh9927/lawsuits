"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        setError(result.error || "SOMETHING WENT WRONG. PLEASE TRY AGAIN.");
      }
    } catch (err) {
      setError("FAILED TO SEND INQUIRY. PLEASE CHECK YOUR CONNECTION.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-12">
          <header className="space-y-4">
             <motion.span 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-[10px] uppercase tracking-[0.5em] text-accent-yellow font-bold block"
             >
                CONSULTING
             </motion.span>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="font-serif text-5xl md:text-7xl text-black uppercase leading-tight"
             >
               GET IN <span className="italic">TOUCH</span>
             </motion.h1>
          </header>

          <section className="space-y-10">
             <div className="flex items-start gap-6 group">
                <div className="p-3 bg-black/5 rounded-full transition-colors group-hover:bg-accent-yellow/10">
                  <MapPin className="w-5 h-5 text-accent-yellow" />
                </div>
                <div>
                   <h3 className="text-black text-[10px] uppercase tracking-[0.2em] font-bold mb-3">OUR ATELIER</h3>
                   <p className="text-zinc-600 font-light text-sm leading-relaxed uppercase tracking-wider max-w-xs">
                      Punjab and Haryana High Court, Sector 1, Chandigarh, Punjab - 160001
                   </p>
                </div>
             </div>
             <div className="flex items-start gap-6 group">
                <div className="p-3 bg-black/5 rounded-full transition-colors group-hover:bg-accent-yellow/10">
                  <Phone className="w-5 h-5 text-accent-yellow" />
                </div>
                <div>
                   <h3 className="text-black text-[10px] uppercase tracking-[0.2em] font-bold mb-3">GET INQUIRIES</h3>
                   <p className="text-zinc-600 font-light text-sm leading-relaxed tracking-widest font-bold">
                      +91 77779 55002
                   </p>
                </div>
             </div>
             <div className="flex items-start gap-6 group">
                <div className="p-3 bg-black/5 rounded-full transition-colors group-hover:bg-accent-yellow/10">
                  <Mail className="w-5 h-5 text-accent-yellow" />
                </div>
                <div>
                   <h3 className="text-black text-[10px] uppercase tracking-[0.2em] font-bold mb-3">EMAIL</h3>
                   <p className="text-zinc-600 font-light text-sm leading-relaxed tracking-widest">
                      THEDRESSOUTFITTERS@GMAIL.COM
                   </p>
                </div>
             </div>
          </section>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white border border-black/5 p-8 md:p-12 space-y-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-sm"
        >
           <AnimatePresence mode="wait">
             {submitted ? (
               <motion.div 
                 key="success"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col items-center justify-center py-20 text-center space-y-6"
               >
                 <div className="w-20 h-20 bg-accent-yellow/10 rounded-full flex items-center justify-center">
                    <Check className="w-10 h-10 text-accent-yellow" />
                 </div>
                 <h2 className="font-serif text-3xl uppercase tracking-tight">INQUIRY RECEIVED</h2>
                 <p className="text-zinc-500 text-sm font-light uppercase tracking-widest leading-relaxed max-w-[250px]">
                    Our concierge will reach out via phone or email within 24 hours.
                 </p>
                 <Button 
                   variant="ghost" 
                   onClick={() => setSubmitted(false)}
                   className="text-[10px] uppercase tracking-[0.3em] font-bold mt-8"
                 >
                    Send Another message
                 </Button>
               </motion.div>
             ) : (
               <motion.form 
                 key="form"
                 onSubmit={handleSubmit}
                 className="space-y-8"
               >
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-zinc-400 font-black block">FULL NAME</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-black/[0.02] border-0 border-b border-black/10 p-4 text-black font-light text-sm focus:border-accent-yellow outline-none transition-all placeholder:text-zinc-300" 
                          placeholder="ADV. ARYAN SINGH" 
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-zinc-400 font-black block">EMAIL ADDRESS</label>
                        <input 
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-black/[0.02] border-0 border-b border-black/10 p-4 text-black font-light text-sm focus:border-accent-yellow outline-none transition-all placeholder:text-zinc-300" 
                          placeholder="EMAIL@ADDRESS.COM" 
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-[0.4em] text-zinc-400 font-black block">MESSAGE</label>
                        <textarea 
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-black/[0.02] border-0 border-b border-black/10 p-4 text-black font-light text-sm focus:border-accent-yellow outline-none transition-all min-h-[150px] placeholder:text-zinc-300" 
                          placeholder="HOW MAY WE ASSIST YOU?" 
                        />
                     </div>
                  </div>

                  {error && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">{error}</p>
                  )}

                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full h-16 bg-black text-white font-bold uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-4 group transition-all hover:bg-zinc-900 disabled:opacity-50"
                  >
                     {loading ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                     ) : (
                       <>
                         SEND INQUIRY
                         <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                       </>
                     )}
                  </button>
               </motion.form>
             )}
           </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
