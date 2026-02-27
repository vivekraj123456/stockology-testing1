"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ArrowRight, Banknote, Clock } from 'lucide-react';

export default function FundTransfer() {
  const MOBILE_NUMBER_LENGTH = 10;
  const [clientCode, setClientCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [leadMobileNo, setLeadMobileNo] = useState('');
  const [leadTncAccepted, setLeadTncAccepted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadStatus, setLeadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleGenerate = () => {
    if (clientCode.trim()) {
      setShowModal(true);
    }
  };

  const bankAccounts = [
    {
      bank: 'HDFC Bank Ltd',
      accountNo: `STKL14${clientCode}`,
      beneficiary: 'Stockology Securities Pvt Ltd USCNB A/C',
      ifsc: 'HDFC0005384',
      MICRCode: '452240046',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const copyToClipboard = (text: string, accountNo: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(accountNo);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^\d{10}$/.test(leadMobileNo)) {
      setLeadStatus({
        type: 'error',
        message: 'Please enter a valid 10-digit mobile number.',
      });
      return;
    }

    if (!leadTncAccepted) {
      setLeadStatus({
        type: 'error',
        message: 'Please accept the Terms & Conditions to continue.',
      });
      return;
    }

    setLeadSubmitting(true);
    setLeadStatus(null);

    try {
      const crmApiEndpoint = process.env.NEXT_PUBLIC_CRM_API_ENDPOINT || '/api/crm/lead';
      const response = await fetch(crmApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNo: leadMobileNo,
          source: 'fund-transfer-cta',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('CRM submission failed');
      }

      setLeadStatus({
        type: 'success',
        message: 'Submitted successfully. We will contact you soon.',
      });
      setLeadMobileNo('');
      setLeadTncAccepted(false);
    } catch (error) {
      console.error('Failed to submit fund transfer lead:', error);
      setLeadStatus({
        type: 'error',
        message: 'Unable to submit right now. Please try again in a moment.',
      });
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>


      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Payment Methods Grid - Side by Side */}
        <div className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">

            {/* NEFT/RTGS/IMPS Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                    <Banknote className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">NEFT/RTGS/IMPS</h2>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Transfer to STOCKOLOGY SECURITIES PRIVATE LIMITED</p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm md:text-base mb-6 leading-relaxed">
                  Transfer money to your account through NEFT, RTGS or IMPS. Generate your personalized bank account number below.
                </p>

                {/* How to Transfer */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">How to transfer?</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">1</span>
                      <p className="text-gray-700 text-sm">Generate your personalized bank account number</p>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">2</span>
                      <p className="text-gray-700 text-sm">Add Stockology Securities Private Limited as beneficiary</p>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">3</span>
                      <p className="text-gray-700 text-sm">Transfer funds like normal NEFT/RTGS/IMPS</p>
                    </div>
                  </div>
                </div>

                {/* Client Code Generator */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-dashed border-gray-300">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Generate Account Number</h3>
                  <p className="text-gray-600 text-sm mb-4">Enter your Trading/Client code</p>

                  <div className="space-y-3">
                    <input
                      id="clientCode"
                      type="text"
                      value={clientCode}
                      onChange={(e) => setClientCode(e.target.value)}
                      placeholder="e.g., 3214"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-gray-900 font-medium text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <motion.button
                      onClick={handleGenerate}
                      disabled={!clientCode.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-2.5 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 text-sm ${clientCode.trim()
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <span>Generate Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                {/* Important Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="max-w-4xl mx-auto mt-8"
                >
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="text-3xl mr-3">⚠️</span>
                      Important Notes
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-yellow-600 text-xl mr-3">•</span>
                        <p className="text-gray-700">Transfer only from the bank account registered with Stockology Securities</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-600 text-xl mr-3">•</span>
                        <p className="text-gray-700">Funds will be reflected within 2 hours on working days to your trading account</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-600 text-xl mr-3">•</span>
                        <p className="text-gray-700">Keep your client code confidential and do not share it with unauthorized persons</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

            </motion.div>

            {/* UPI Payment Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">UPI Payment</h2>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Pay to Stockology Securities Private Limited</p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm md:text-base mb-6 leading-relaxed">
                  Transfer funds instantly via UPI from the Stockology Securities Private Limited app under my accounts tab.
                </p>

                {/* UPI Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center">
                      <Clock className="w-3 h-3 mr-1.5" />
                      Instant
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">⏱</div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Time taken:</p>
                        <p className="text-gray-700 text-xs">Instant (Ledger posting by end of day)</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">₹</div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Charges:</p>
                        <p className="text-green-600 font-bold text-sm">Free</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Number Generation Instructions */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-dashed border-gray-300">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Account Generation Rules
                  </h3>

                  <div className="space-y-4">
                    <p className="text-gray-700 text-sm font-medium">
                      Your personalized Bank account number for fund transfers is automatically generated using a fixed format:
                    </p>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-center">
                      <div className="flex gap-2 text-lg md:text-xl items-center font-mono">
                        <span className="font-bold text-green-600 py-1 px-3 bg-green-50 rounded-md border border-green-200">STKL14</span>
                        <span className="text-gray-400 font-bold">+</span>
                        <span className="font-bold text-gray-700 py-1 px-3 bg-gray-50 rounded-md border border-gray-200">&lt;Client Code&gt;</span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-sm text-gray-600 mt-4">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Prefix is always <strong className="text-gray-900">STKL14</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Suffix is your unique <strong className="text-gray-900">Trading / Client Code</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Example: If your client code is <strong>3214</strong>, your account number will be <strong className="text-green-600 font-mono">STKL143214</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Common Beneficiary Details */}
                <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)] transition-all duration-300 transform relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-600 opacity-80 group-hover:w-1.5 transition-all duration-300"></div>

                  <h4 className="text-gray-900 font-extrabold flex items-center gap-2.5 mb-6 text-lg tracking-tight pl-2">
                    <div className="p-1.5 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Common Details for Transfer
                  </h4>

                  <div className="space-y-4 pl-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-gray-50/80 gap-2">
                      <span className="text-gray-500 font-medium text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        Beneficiary Name
                      </span>
                      <div className="flex items-center space-x-3 sm:justify-end">
                        <span className="text-gray-900 font-bold text-[15px] max-w-[200px] md:max-w-none break-words">Stockology Securities Pvt Ltd USCNB A/C</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("Stockology Securities Pvt Ltd USCNB A/C");
                            setCopiedAccount("Stockology Securities Pvt Ltd USCNB A/C-beneficiary");
                            setTimeout(() => setCopiedAccount(null), 2000);
                          }}
                          className="p-2 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-lg transition-all shrink-0 hover:scale-105 active:scale-95 text-gray-400 hover:text-green-600 group/btn"
                          title="Copy Beneficiary Name"
                        >
                          {copiedAccount === "Stockology Securities Pvt Ltd USCNB A/C-beneficiary" ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 group-hover/btn:text-green-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-4 border-b border-gray-50/80 gap-2">
                      <span className="text-gray-500 font-medium text-sm flex items-center gap-2 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        IFSC Code
                      </span>
                      <div className="flex flex-col sm:items-end">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-900 font-black tracking-widest text-[15px]">HDFC0005384</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText("HDFC0005384");
                              setCopiedAccount("HDFC0005384-ifsc-common");
                              setTimeout(() => setCopiedAccount(null), 2000);
                            }}
                            className="p-2 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-lg transition-all shrink-0 hover:scale-105 active:scale-95 text-gray-400 hover:text-green-600 group/btn"
                            title="Copy IFSC code"
                          >
                            {copiedAccount === "HDFC0005384-ifsc-common" ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 group-hover/btn:text-green-600" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md font-medium border border-amber-100/50">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          fifth character is Zero
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-1">
                      <span className="text-gray-500 font-medium text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        MICR Code
                      </span>
                      <div className="flex items-center space-x-3 sm:justify-end">
                        <span className="text-gray-900 font-black tracking-widest text-[15px]">452240046</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("452240046");
                            setCopiedAccount("452240046-micr-common");
                            setTimeout(() => setCopiedAccount(null), 2000);
                          }}
                          className="p-2 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-lg transition-all shrink-0 hover:scale-105 active:scale-95 text-gray-400 hover:text-green-600 group/btn"
                          title="Copy MICR Code"
                        >
                          {copiedAccount === "452240046-micr-common" ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 group-hover/btn:text-green-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#12181a,#1b2326)] text-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 p-6 lg:p-10 w-full items-center">
            <div className="w-full lg:w-[60%] flex flex-col justify-center">
              <h2 className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl text-center lg:text-left">
                Open a <span className="text-yellow-400">Free</span> Demat Account in{" "}
                <span className="text-yellow-400">5 Mins.</span>
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 max-w-lg mx-auto lg:mx-0">
                {[
                  "Free AMC for First Year",
                  "Free Research",
                  "Low DP Charges (₹10)",
                  "No Auto Square Off Charges",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 justify-start sm:mx-auto lg:mx-0 w-[240px] md:w-auto">
                    <div className="h-8 w-8 rounded-full border border-emerald-300/80 bg-emerald-400/10 flex-shrink-0" />
                    <p className="text-lg font-semibold text-white/95 text-left truncate">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleLeadSubmit}
              className="w-full lg:w-[40%] rounded-2xl bg-black/20 p-5 sm:p-6 md:p-8 backdrop-blur-sm border border-white/5"
            >
              <label htmlFor="fund-transfer-lead-mobile" className="sr-only">
                Mobile Number
              </label>
              <input
                id="fund-transfer-lead-mobile"
                type="tel"
                value={leadMobileNo}
                onChange={(event) => {
                  const normalized = event.target.value.replace(/\D/g, '').slice(0, MOBILE_NUMBER_LENGTH);
                  setLeadMobileNo(normalized);
                  if (leadStatus) {
                    setLeadStatus(null);
                  }
                }}
                onInvalid={(event) => {
                  event.currentTarget.setCustomValidity('Please enter 10 digit number');
                }}
                onInput={(event) => {
                  event.currentTarget.setCustomValidity('');
                }}
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={MOBILE_NUMBER_LENGTH}
                placeholder="Mobile Number"
                className="w-full rounded-xl border border-white/30 bg-white/90 px-5 py-3 text-lg font-medium text-gray-900 placeholder:text-gray-500 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/40"
              />

              <label className="mt-4 flex items-start gap-2 text-sm text-white/90">
                <input
                  type="checkbox"
                  checked={leadTncAccepted}
                  onChange={(event) => {
                    setLeadTncAccepted(event.target.checked);
                    if (leadStatus) {
                      setLeadStatus(null);
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-white/40 bg-white/90 text-emerald-600 focus:ring-emerald-400"
                />
                <span>
                  I agree &amp; accept{" "}
                  <a
                    href="/Terms-&-Conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-yellow-400 hover:text-yellow-300"
                  >
                    T&amp;C
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={leadSubmitting}
                className="mt-5 w-full rounded-xl bg-yellow-400 px-4 py-3 text-lg font-semibold text-gray-900 transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {leadSubmitting ? 'Submitting...' : 'Submit'}
              </button>

              {leadStatus && (
                <p className={`mt-3 text-sm ${leadStatus.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {leadStatus.message}
                </p>
              )}
            </form>
          </div>
        </section>


      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-24 md:items-center md:pt-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-7rem)] md:max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Bank Account Details</h2>
                <p className="text-green-50">You can fund your equity trading account by transferring money to any of the following bank accounts:</p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {bankAccounts.map((account, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200 hover:border-green-300 transition-all"
                  >
                    <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${account.color} text-white font-bold mb-4`}>
                      {account.bank}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Bank Account No.:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 font-bold text-lg">{account.accountNo}</span>
                          <button
                            onClick={() => copyToClipboard(account.accountNo, account.accountNo)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                            title="Copy account number"
                          >
                            {copiedAccount === account.accountNo ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Beneficiary Name:</span>
                        <div className="flex items-center space-x-2">

                          <span className="text-gray-900 font-semibold">{account.beneficiary}</span>
                          <button
                            onClick={() => copyToClipboard(account.beneficiary, `${account.beneficiary}-beneficiary`)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                            title="Copy Beneficiary Name"
                          >
                            {copiedAccount === `${account.beneficiary}-beneficiary` ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">IFSC Code:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 font-bold">{account.ifsc}</span>
                          <button
                            onClick={() => copyToClipboard(account.ifsc, `${account.accountNo}-ifsc`)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                            title="Copy IFSC code"
                          >
                            {copiedAccount === `${account.accountNo}-ifsc` ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>


                        </div>

                      </div>
                      <p className="text-gray-900 font-bold text-right">( fifth character is Zero )</p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">MICR Code:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 font-bold">{account.MICRCode}</span>
                          <button
                            onClick={() => copyToClipboard(account.MICRCode, `${account.accountNo}-micr`)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                            title="Copy MICR Code"
                          >
                            {copiedAccount === `${account.accountNo}-micr` ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>


                        </div>

                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">How to transfer?</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">1</span>
                      <p className="text-gray-700 text-sm"> Login to your net banking account Add Stockology Securities Pvt Ltd USCNB A/C as a beneficiary </p>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">2</span>
                      <p className="text-gray-700 text-sm">After adding the beneficiary, you can transfer funds anytime using NEFT/RTGS/IMPS just like a normal bank transfer. </p>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">3</span>
                      <p className="text-gray-700 text-sm">Transfer funds like normal NEFT/RTGS/IMPS</p>
                    </div>
                  </div>
                </div>
                {/* Modal Footer */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please ensure you transfer funds only from your registered bank account with your demat account. Transfers from unregistered accounts not accepted.
                  </p>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
