
"use client";

import Link from "next/link";
import { AppIcon } from "@/app/icon-component";
import { Twitter, Facebook, Linkedin, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function PublicFooter() {
    const { t } = useLanguage();
    return (
      <footer id="contact" className="border-t bg-secondary/50 text-foreground">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                  <AppIcon className="size-8 text-primary" />
                  <span className="font-bold font-headline text-lg">PoultryMitra</span>
              </div>
              <p className="text-sm text-muted-foreground">
                  Powering poultry farms with AI-driven insights and management tools.
              </p>
               <div className="flex space-x-4 mt-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter /></Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground"><Facebook /></Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground"><Linkedin /></Link>
              </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold">Quick Links</h4>
                <ul className="space-y-2">
                    <li><Link href="/#about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
                    <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                    <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                    <li><Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground">Tools</Link></li>
                </ul>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Legal</h4>
                <ul className="space-y-2">
                    <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                    <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                </ul>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Contact Us</h4>
                <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                        <Mail className="size-4 text-muted-foreground" />
                        <a href="mailto:ipoultrymitra@gmail.com" className="text-sm text-muted-foreground hover:text-foreground">ipoultrymitra@gmail.com</a>
                    </li>
                    <li className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">+91-9876543210</span>
                    </li>
                </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    );
}
