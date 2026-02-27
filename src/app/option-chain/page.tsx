"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

/* ─── types ─── */
interface OptionContract {
    contractSymbol: string;
    strike: number;
    lastPrice: number;
    change: number;
    percentChange: number;
    volume: number;
    openInterest: number;
    bid: number;
    ask: number;
    impliedVolatility: number;
    inTheMoney: boolean;
}

interface ExpiryDate {
    timestamp: number;
    date: string;
    label: string;
}

interface UnderlyingInfo {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    dayHigh: number;
    dayLow: number;
    open: number;
    previousClose: number;
    volume: number;
    currency: string;
}

interface OptionChainData {
    underlying: UnderlyingInfo;
    expirationDates: ExpiryDate[];
    strikes: number[];
    calls: OptionContract[];
    puts: OptionContract[];
    currentExpiry: string | null;
    timestamp: string;
}

interface SearchResult {
    symbol: string;
    yahooSymbol: string;
    name: string;
}

/* ─── constants ─── */
const DEFAULT_SYMBOL = "AAPL";
const AUTO_REFRESH_MS = 30_000;

const POPULAR_SYMBOLS = [
    { symbol: "AAPL", label: "Apple" },
    { symbol: "MSFT", label: "Microsoft" },
    { symbol: "GOOGL", label: "Google" },
    { symbol: "AMZN", label: "Amazon" },
    { symbol: "TSLA", label: "Tesla" },
    { symbol: "META", label: "Meta" },
    { symbol: "NVDA", label: "NVIDIA" },
    { symbol: "SPY", label: "S&P 500 ETF" },
];

/* ─── helpers ─── */
function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toLocaleString("en-US");
}

function cn(...classes: (string | false | undefined | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

function getCurrencySymbol(currency: string): string {
    if (currency === "INR") return "₹";
    if (currency === "USD") return "$";
    if (currency === "EUR") return "€";
    if (currency === "GBP") return "£";
    return currency + " ";
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function OptionChainPage() {
    /* state */
    const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [data, setData] = useState<OptionChainData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedExpiry, setSelectedExpiry] = useState<number | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>("");
    const searchRef = useRef<HTMLDivElement>(null);
    const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── fetch option chain ── */
    const fetchData = useCallback(
        async (sym: string, expiryTs?: number) => {
            setLoading(true);
            setError(null);
            try {
                let url = `/api/option-chain?symbol=${encodeURIComponent(sym)}`;
                if (expiryTs) url += `&date=${expiryTs}`;

                const res = await fetch(url);
                const json = await res.json();

                if (!json.success) {
                    setError(json.error ?? "Failed to fetch data");
                    setData(null);
                    return;
                }

                setData(json.data);
                setLastUpdate(
                    new Date().toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })
                );

                // Auto-select first expiry if none selected
                if (
                    !expiryTs &&
                    json.data.expirationDates?.length > 0 &&
                    !selectedExpiry
                ) {
                    setSelectedExpiry(json.data.expirationDates[0].timestamp);
                }
            } catch {
                setError("Network error. Please try again.");
                setData(null);
            } finally {
                setLoading(false);
            }
        },
        [selectedExpiry]
    );

    /* ── initial load + auto refresh ── */
    useEffect(() => {
        fetchData(symbol, selectedExpiry ?? undefined);

        refreshTimer.current = setInterval(() => {
            fetchData(symbol, selectedExpiry ?? undefined);
        }, AUTO_REFRESH_MS);

        return () => {
            if (refreshTimer.current) clearInterval(refreshTimer.current);
        };
    }, [symbol, selectedExpiry, fetchData]);

    /* ── search ── */
    useEffect(() => {
        if (!searchInput.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/stocks/search?q=${encodeURIComponent(searchInput)}&exchange=NSE`
                );
                const json = await res.json();
                if (json.success && json.data?.results) {
                    setSearchResults(json.data.results.slice(0, 6));
                }
            } catch {
                /* silent */
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    /* ── click outside search ── */
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearch(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function selectSymbol(sym: string) {
        const clean = sym.replace(/\.(NS|BO)$/i, "").toUpperCase();
        setSymbol(clean);
        setSearchInput("");
        setShowSearch(false);
        setSelectedExpiry(null);
        setData(null);
    }

    function handleExpiryChange(ts: number) {
        setSelectedExpiry(ts);
    }

    /* ── merge calls & puts by strike ── */
    const mergedRows = React.useMemo(() => {
        if (!data) return [];
        const callMap = new Map(data.calls.map((c) => [c.strike, c]));
        const putMap = new Map(data.puts.map((p) => [p.strike, p]));
        const allStrikes = Array.from(
            new Set([
                ...data.calls.map((c) => c.strike),
                ...data.puts.map((p) => p.strike),
            ])
        ).sort((a, b) => a - b);

        return allStrikes.map((strike) => ({
            strike,
            call: callMap.get(strike) ?? null,
            put: putMap.get(strike) ?? null,
        }));
    }, [data]);

    /* ── find ATM strike ── */
    const atmStrike = React.useMemo(() => {
        if (!data || mergedRows.length === 0) return 0;
        const spotPrice = data.underlying.price;
        let closest = mergedRows[0].strike;
        let minDiff = Math.abs(spotPrice - closest);
        for (const row of mergedRows) {
            const diff = Math.abs(spotPrice - row.strike);
            if (diff < minDiff) {
                minDiff = diff;
                closest = row.strike;
            }
        }
        return closest;
    }, [data, mergedRows]);

    const curr = data ? getCurrencySymbol(data.underlying.currency) : "$";

    /* ═══════════════ RENDER ═══════════════ */
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* ── Header ── */}
            <div className="border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
                <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <Link
                                href="/"
                                className="mb-1 inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-emerald-400"
                            >
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Back to Home
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                    Option Chain
                                </span>
                            </h1>
                            <p className="mt-1 text-sm text-slate-400">
                                Real-time options data · Powered by Yahoo Finance
                            </p>
                        </div>

                        {/* Search bar */}
                        <div ref={searchRef} className="relative w-full md:w-96">
                            <div className="relative">
                                <svg
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search stock (e.g. AAPL, TSLA, MSFT)..."
                                    value={searchInput}
                                    onChange={(e) => {
                                        setSearchInput(e.target.value);
                                        setShowSearch(true);
                                    }}
                                    onFocus={() => setShowSearch(true)}
                                    className="w-full rounded-xl border border-slate-700/60 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            {/* Search dropdown */}
                            {showSearch &&
                                (searchResults.length > 0 || searchInput.trim()) && (
                                    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/95 shadow-2xl backdrop-blur-md">
                                        {searchResults.length > 0 ? (
                                            searchResults.map((r) => (
                                                <button
                                                    key={r.yahooSymbol}
                                                    onClick={() =>
                                                        selectSymbol(r.symbol || r.yahooSymbol)
                                                    }
                                                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-emerald-500/10"
                                                >
                                                    <span className="font-semibold text-emerald-400">
                                                        {r.symbol}
                                                    </span>
                                                    <span className="ml-3 truncate text-xs text-slate-400">
                                                        {r.name}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-center text-xs text-slate-500">
                                                No results found
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Popular symbols */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {POPULAR_SYMBOLS.map((s) => (
                            <button
                                key={s.symbol}
                                onClick={() => selectSymbol(s.symbol)}
                                className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                                    symbol === s.symbol
                                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                                        : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-white"
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
                {/* ── Error state ── */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        <span className="mr-2 font-semibold">⚠</span>
                        {error}
                        <button
                            onClick={() => fetchData(symbol, selectedExpiry ?? undefined)}
                            className="ml-4 rounded-lg bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/30"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Loading skeleton ── */}
                {loading && !data && (
                    <div className="space-y-4">
                        <div className="h-28 animate-pulse rounded-2xl bg-slate-800/60" />
                        <div className="h-12 animate-pulse rounded-xl bg-slate-800/60" />
                        <div className="h-[60vh] animate-pulse rounded-2xl bg-slate-800/60" />
                    </div>
                )}

                {data && (
                    <>
                        {/* ── Underlying info card ── */}
                        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-r from-slate-800/40 via-slate-800/20 to-slate-800/40 p-5 shadow-lg">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-white sm:text-2xl">
                                            {data.underlying.name}
                                        </h2>
                                        <span className="rounded-lg bg-slate-700/50 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                                            {data.underlying.symbol}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-baseline gap-3">
                                        <span className="text-3xl font-black tabular-nums tracking-tight">
                                            {curr}
                                            {data.underlying.price.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                        <span
                                            className={cn(
                                                "rounded-lg px-2.5 py-1 text-sm font-bold",
                                                data.underlying.change >= 0
                                                    ? "bg-emerald-500/15 text-emerald-400"
                                                    : "bg-red-500/15 text-red-400"
                                            )}
                                        >
                                            {data.underlying.change >= 0 ? "+" : ""}
                                            {data.underlying.change.toFixed(2)} (
                                            {data.underlying.changePercent.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                                    {[
                                        { label: "Open", value: data.underlying.open },
                                        {
                                            label: "Prev Close",
                                            value: data.underlying.previousClose,
                                        },
                                        { label: "Day High", value: data.underlying.dayHigh },
                                        { label: "Day Low", value: data.underlying.dayLow },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="text-xs text-slate-500">{item.label}</div>
                                            <div className="font-semibold tabular-nums text-slate-200">
                                                {curr}
                                                {item.value.toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Refresh info */}
                            <div className="mt-4 flex items-center justify-between border-t border-slate-700/40 pt-3">
                                <span className="text-xs text-slate-500">
                                    {lastUpdate && `Last updated: ${lastUpdate}`}
                                    {" · "}Auto-refreshes every 30s
                                </span>
                                <button
                                    onClick={() => fetchData(symbol, selectedExpiry ?? undefined)}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25 disabled:opacity-50"
                                >
                                    <svg
                                        className={cn("h-3.5 w-3.5", loading && "animate-spin")}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* ── Expiry date selector ── */}
                        {data.expirationDates.length > 0 && (
                            <div className="mb-6">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Expiry Date
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-hide">
                                    {data.expirationDates.map((exp) => (
                                        <button
                                            key={exp.timestamp}
                                            onClick={() => handleExpiryChange(exp.timestamp)}
                                            className={cn(
                                                "rounded-lg px-3 py-2 text-xs font-semibold transition",
                                                selectedExpiry === exp.timestamp
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                                    : "border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:border-emerald-500/40 hover:text-white"
                                            )}
                                        >
                                            {exp.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Legend ── */}
                        {mergedRows.length > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded bg-emerald-500/20 ring-1 ring-emerald-500/30" />
                                    <span>Call ITM</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded bg-red-500/20 ring-1 ring-red-500/30" />
                                    <span>Put ITM</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded bg-amber-400/30 ring-1 ring-amber-400/40" />
                                    <span>ATM Strike</span>
                                </div>
                            </div>
                        )}

                        {/* ── Option chain table ── */}
                        {mergedRows.length > 0 ? (
                            <div className="overflow-hidden rounded-2xl border border-slate-800/60 shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1100px] border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-700/50">
                                                <th
                                                    colSpan={7}
                                                    className="border-r border-slate-700/30 bg-emerald-500/10 py-2.5 text-center text-sm font-bold text-emerald-400"
                                                >
                                                    CALLS
                                                </th>
                                                <th className="bg-slate-700/30 px-4 py-2.5 text-center text-sm font-bold text-amber-300">
                                                    STRIKE
                                                </th>
                                                <th
                                                    colSpan={7}
                                                    className="border-l border-slate-700/30 bg-red-500/10 py-2.5 text-center text-sm font-bold text-red-400"
                                                >
                                                    PUTS
                                                </th>
                                            </tr>
                                            <tr className="border-b border-slate-700/50 bg-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                <th className="px-2 py-2 text-right">OI</th>
                                                <th className="px-2 py-2 text-right">Chg</th>
                                                <th className="px-2 py-2 text-right">Vol</th>
                                                <th className="px-2 py-2 text-right">IV %</th>
                                                <th className="px-2 py-2 text-right">LTP</th>
                                                <th className="px-2 py-2 text-right">Bid</th>
                                                <th className="border-r border-slate-700/30 px-2 py-2 text-right">Ask</th>
                                                <th className="bg-slate-700/20 px-4 py-2 text-center font-bold text-amber-300">{curr}</th>
                                                <th className="border-l border-slate-700/30 px-2 py-2 text-right">Bid</th>
                                                <th className="px-2 py-2 text-right">Ask</th>
                                                <th className="px-2 py-2 text-right">LTP</th>
                                                <th className="px-2 py-2 text-right">IV %</th>
                                                <th className="px-2 py-2 text-right">Vol</th>
                                                <th className="px-2 py-2 text-right">Chg</th>
                                                <th className="px-2 py-2 text-right">OI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mergedRows.map((row) => {
                                                const isATM = row.strike === atmStrike;
                                                const callITM = row.call?.inTheMoney ?? false;
                                                const putITM = row.put?.inTheMoney ?? false;

                                                return (
                                                    <tr
                                                        key={row.strike}
                                                        className={cn(
                                                            "border-b border-slate-800/40 transition-colors hover:bg-slate-700/20",
                                                            isATM &&
                                                            "ring-1 ring-inset ring-amber-400/30 bg-amber-400/5"
                                                        )}
                                                    >
                                                        {/* ── Calls (left) ── */}
                                                        <Cell itm={callITM} side="call">
                                                            {row.call ? formatNumber(row.call.openInterest) : "—"}
                                                        </Cell>
                                                        <Cell itm={callITM} side="call">
                                                            {row.call ? (
                                                                <Chg value={row.call.change} />
                                                            ) : "—"}
                                                        </Cell>
                                                        <Cell itm={callITM} side="call">
                                                            {row.call ? formatNumber(row.call.volume) : "—"}
                                                        </Cell>
                                                        <Cell itm={callITM} side="call">
                                                            {row.call ? row.call.impliedVolatility.toFixed(1) : "—"}
                                                        </Cell>
                                                        <Cell itm={callITM} side="call" bold>
                                                            {row.call ? (
                                                                <span className={row.call.change >= 0 ? "text-emerald-300" : "text-red-300"}>
                                                                    {row.call.lastPrice.toFixed(2)}
                                                                </span>
                                                            ) : "—"}
                                                        </Cell>
                                                        <Cell itm={callITM} side="call" muted>
                                                            {row.call ? row.call.bid.toFixed(2) : "—"}
                                                        </Cell>
                                                        <Cell itm={callITM} side="call" muted borderR>
                                                            {row.call ? row.call.ask.toFixed(2) : "—"}
                                                        </Cell>

                                                        {/* ── Strike (center) ── */}
                                                        <td
                                                            className={cn(
                                                                "px-4 py-1.5 text-center font-bold tabular-nums",
                                                                isATM
                                                                    ? "bg-amber-400/15 text-amber-300"
                                                                    : "bg-slate-700/15 text-white"
                                                            )}
                                                        >
                                                            {row.strike.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </td>

                                                        {/* ── Puts (right) ── */}
                                                        <Cell itm={putITM} side="put" muted borderL>
                                                            {row.put ? row.put.bid.toFixed(2) : "—"}
                                                        </Cell>
                                                        <Cell itm={putITM} side="put" muted>
                                                            {row.put ? row.put.ask.toFixed(2) : "—"}
                                                        </Cell>
                                                        <Cell itm={putITM} side="put" bold>
                                                            {row.put ? (
                                                                <span className={row.put.change >= 0 ? "text-emerald-300" : "text-red-300"}>
                                                                    {row.put.lastPrice.toFixed(2)}
                                                                </span>
                                                            ) : "—"}
                                                        </Cell>
                                                        <Cell itm={putITM} side="put">
                                                            {row.put ? row.put.impliedVolatility.toFixed(1) : "—"}
                                                        </Cell>
                                                        <Cell itm={putITM} side="put">
                                                            {row.put ? formatNumber(row.put.volume) : "—"}
                                                        </Cell>
                                                        <Cell itm={putITM} side="put">
                                                            {row.put ? <Chg value={row.put.change} /> : "—"}
                                                        </Cell>
                                                        <Cell itm={putITM} side="put">
                                                            {row.put ? formatNumber(row.put.openInterest) : "—"}
                                                        </Cell>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table footer */}
                                <div className="border-t border-slate-800/60 bg-slate-900/40 px-4 py-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                        <span>
                                            Showing {mergedRows.length} strikes · Spot: {curr}
                                            {data.underlying.price.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                        <span>
                                            Total Call OI:{" "}
                                            {formatNumber(data.calls.reduce((s, c) => s + c.openInterest, 0))}
                                            {" · "}Total Put OI:{" "}
                                            {formatNumber(data.puts.reduce((s, p) => s + p.openInterest, 0))}
                                            {" · "}PCR:{" "}
                                            {data.calls.reduce((s, c) => s + c.openInterest, 0) > 0
                                                ? (
                                                    data.puts.reduce((s, p) => s + p.openInterest, 0) /
                                                    data.calls.reduce((s, c) => s + c.openInterest, 0)
                                                ).toFixed(2)
                                                : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !loading && (
                                <div className="rounded-2xl border border-slate-800/60 bg-slate-800/30 px-6 py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/30">
                                        <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-400">
                                        No option chain data available for this symbol
                                    </p>
                                    <p className="mt-2 text-xs text-slate-600">
                                        Options data is available for US-listed stocks. Try searching for AAPL, TSLA, MSFT, NVDA, etc.
                                    </p>
                                </div>
                            )
                        )}

                        {/* ── OI Summary cards ── */}
                        {mergedRows.length > 0 && (
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    {
                                        title: "Total Call OI",
                                        value: formatNumber(data.calls.reduce((s, c) => s + c.openInterest, 0)),
                                        color: "emerald" as const,
                                    },
                                    {
                                        title: "Total Put OI",
                                        value: formatNumber(data.puts.reduce((s, p) => s + p.openInterest, 0)),
                                        color: "red" as const,
                                    },
                                    {
                                        title: "Put-Call Ratio (OI)",
                                        value:
                                            data.calls.reduce((s, c) => s + c.openInterest, 0) > 0
                                                ? (
                                                    data.puts.reduce((s, p) => s + p.openInterest, 0) /
                                                    data.calls.reduce((s, c) => s + c.openInterest, 0)
                                                ).toFixed(3)
                                                : "N/A",
                                        color: "cyan" as const,
                                    },
                                    {
                                        title: "Max Pain Strike",
                                        value: (() => {
                                            let maxOI = 0;
                                            let maxStrike = 0;
                                            for (const row of mergedRows) {
                                                const combined =
                                                    (row.call?.openInterest ?? 0) + (row.put?.openInterest ?? 0);
                                                if (combined > maxOI) {
                                                    maxOI = combined;
                                                    maxStrike = row.strike;
                                                }
                                            }
                                            return `${curr}${maxStrike.toLocaleString("en-US")}`;
                                        })(),
                                        color: "amber" as const,
                                    },
                                ].map((card) => (
                                    <div
                                        key={card.title}
                                        className="rounded-xl border border-slate-800/60 bg-slate-800/30 p-4 transition hover:bg-slate-800/50"
                                    >
                                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            {card.title}
                                        </div>
                                        <div
                                            className={cn(
                                                "mt-1 text-2xl font-bold tabular-nums",
                                                card.color === "emerald" && "text-emerald-400",
                                                card.color === "red" && "text-red-400",
                                                card.color === "cyan" && "text-cyan-400",
                                                card.color === "amber" && "text-amber-400"
                                            )}
                                        >
                                            {card.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Disclaimer ── */}
                        <div className="mt-8 rounded-xl border border-slate-800/40 bg-slate-900/30 px-5 py-3 text-xs leading-relaxed text-slate-600">
                            <strong className="text-slate-500">Disclaimer:</strong> Options
                            data is sourced from Yahoo Finance and may be delayed. This is for
                            informational purposes only and should not be considered
                            investment advice. Options data is currently available for
                            US-listed stocks and ETFs.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ── Reusable table cell ── */
function Cell({
    children,
    itm,
    side,
    bold,
    muted,
    borderR,
    borderL,
}: {
    children: React.ReactNode;
    itm: boolean;
    side: "call" | "put";
    bold?: boolean;
    muted?: boolean;
    borderR?: boolean;
    borderL?: boolean;
}) {
    const empty = children === "—";
    return (
        <td
            className={cn(
                "px-2 py-1.5 text-right tabular-nums",
                itm && side === "call" && "bg-emerald-500/[0.07]",
                itm && side === "put" && "bg-red-500/[0.07]",
                bold && "font-semibold",
                muted && !empty && "text-slate-400",
                empty && "text-slate-700",
                borderR && "border-r border-slate-700/30",
                borderL && "border-l border-slate-700/30"
            )}
        >
            {children}
        </td>
    );
}

/* ── Change badge ── */
function Chg({ value }: { value: number }) {
    return (
        <span className={value >= 0 ? "text-emerald-400" : "text-red-400"}>
            {value >= 0 ? "+" : ""}
            {value.toFixed(2)}
        </span>
    );
}
