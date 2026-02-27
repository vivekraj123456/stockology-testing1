import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
  FaTelegram,
  FaApple,
  FaLocationDot
} from "react-icons/fa6";
import { IoCallOutline } from "react-icons/io5";
import { MdAccessTimeFilled, MdOutlineMailOutline } from "react-icons/md";
import { QrCode } from "lucide-react";
import { footerData } from "../footerData";
import Footerend from "./Footerend";

const socialIconMap = {
  facebook: { icon: FaFacebookF, bg: "bg-[#1877f2]" },
  twitter: { icon: FaXTwitter, bg: "bg-[#1da1f2]" },
  linkedin: { icon: FaLinkedinIn, bg: "bg-[#0a66c2]" },
  instagram: { icon: FaInstagram, bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" },
  youtube: { icon: FaYoutube, bg: "bg-[#ff0000]" },
  telegram: { icon: FaTelegram, bg: "bg-[#0088cc]" }
};

type SocialKey = keyof typeof socialIconMap;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerColumns = footerData.columns.filter(
    (section) => section.links && section.links.length > 0
  );

  return (
    <>
      <footer className="bg-[#1c1c1c] text-white py-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          {/* Top Section - 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12">

            {/* Column 1: Brand & Slogan (Spans 4 columns on large screens) */}
            <div className="lg:col-span-4 xl:col-span-4 pr-0 lg:pr-8 flex flex-col items-center lg:items-start text-center lg:text-left">
              <Link href="/" className="inline-block mb-8 text-white text-3xl sm:text-4xl font-black tracking-tight hover:text-gray-200 transition-colors">
                Stockology
              </Link>

              <h3 className="text-white font-bold text-xl sm:text-2xl mb-4">
                100% Safe & Secure Platform.
              </h3>

              <p className="text-[#a0a0a0] text-[15px] leading-relaxed mb-8 max-w-sm">
                Stockology encrypts all data and transactions to ensure a completely secure experience for our members.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 w-full">
                {footerData.socialLinks.map((item) => {
                  const socialData = socialIconMap[item.icon as SocialKey];
                  if (!socialData) return null;
                  const Icon = socialData.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.path}
                      aria-label={item.label}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:scale-110 shadow-lg ${socialData.bg}`}
                    >
                      <Icon className="text-[18px]" />
                    </Link>
                  );
                })}
              </div>

              {/* App Download Buttons moved here under social media logos */}
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-8 justify-center lg:justify-start">
                {/* Apple App Store Button */}
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg border border-[#404040] bg-black px-4 py-2 hover:bg-[#1a1a1a] transition-colors flex-1 justify-center sm:justify-start min-w-[150px] max-w-[200px] lg:max-w-none mx-auto lg:mx-0"
                >
                  <FaApple className="text-2xl text-white" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] text-gray-400 font-medium">Download on the</span>
                    <span className="text-[15px] text-white font-semibold mt-0.5">App Store</span>
                  </div>
                </Link>

                {/* Google Play Button */}
                {footerData.appLinks.map((app) => (
                  <Link
                    key={app.name}
                    href={app.path}
                    target={app.path.startsWith("http") ? "_blank" : undefined}
                    rel={app.path.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 rounded-lg border border-[#404040] bg-black px-4 py-2 hover:bg-[#1a1a1a] transition-colors flex-1 justify-center sm:justify-start min-w-[150px] max-w-[200px] lg:max-w-none mx-auto lg:mx-0"
                  >
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg"
                      alt="Google Play"
                      width={22}
                      height={22}
                      className="object-contain"
                    />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] text-gray-400 font-medium">GET IT ON</span>
                      <span className="text-[15px] text-white font-semibold mt-0.5">Google Play</span>
                    </div>
                  </Link>
                ))}
              </div>

            </div>

            {/* Columns 2-4: Links (Spans 5 columns on large screens) */}
            <div className="lg:col-span-5 xl:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {footerColumns.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-white">
                    {section.title}
                  </h4>
                  <ul className="space-y-4">
                    {section.links.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.path}
                          className="text-[14px] text-[#a0a0a0] hover:text-[#10b981] hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300 block"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Column 5: Contact Info (Spans 3 columns on large screens) */}
            <div className="lg:col-span-3 xl:col-span-3 flex flex-col items-start space-y-8 lg:pl-6">

              {/* Contact Info */}
              <div className="space-y-6 w-full">
                <div className="flex items-start gap-4">
                  <FaLocationDot className="mt-1 text-xl text-[#ffffff] shrink-0" />
                  <p className="text-[#a0a0a0] text-[14px] leading-relaxed">
                    {footerData.contact.address}
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <MdAccessTimeFilled className="mt-1 text-xl text-[#ffffff] shrink-0" />
                  <p className="text-[#a0a0a0] text-[14px] leading-relaxed">
                    {footerData.contact.workingHours.weekday}
                    <br />
                    {footerData.contact.workingHours.saturday}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <IoCallOutline className="text-xl text-[#ffffff] shrink-0" />
                  <Link
                    href={`tel:${footerData.contact.phoneHref}`}
                    className="text-[#a0a0a0] text-[14px] hover:text-white transition-colors"
                  >
                    {footerData.contact.phone}
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  <MdOutlineMailOutline className="text-xl text-[#ffffff] shrink-0" />
                  <Link
                    href={`mailto:${footerData.contact.email}`}
                    className="text-[#a0a0a0] text-[14px] hover:text-white transition-colors"
                  >
                    {footerData.contact.email}
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </footer>

      {/* Reusing existing Footerend as is, keeping its white background design */}
      <section className="border-t border-slate-300 bg-white">
        <Footerend />
      </section>

      <div className="bg-[#141414] border-t border-[#333]">
        <div className="mx-auto max-w-[1400px] px-6 py-6 text-center text-sm text-[#808080]">
          <p>© {currentYear} Stockology Securities Private Limited. All Rights Reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Footer;
