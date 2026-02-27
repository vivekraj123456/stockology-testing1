import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ─── Constants & Types ─── */

const CRUMB_TTL_MS = 5 * 60 * 1000;
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const US_STOCKS = new Set([
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "TSLA",
    "META",
    "NVDA",
    "SPY",
    "NFLX",
    "AMD",
]);

const INDIAN_INDICES = new Set([
    "NIFTY",
    "BANKNIFTY",
    "FINNIFTY",
    "MIDCPNIFTY",
    "SENSEX",
    "BANKEX",
]);

const INDEX_MAP: Record<string, string> = {
    NIFTY: "^NSEI",
    NIFTY50: "^NSEI",
    "NIFTY 50": "^NSEI",
    SENSEX: "^BSESN",
    BANKNIFTY: "^NSEBANK",
    "BANK NIFTY": "^NSEBANK",
    NIFTYBANK: "^NSEBANK",
};

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
    expiration: number;
    lastTradeDate: number;
}

/* ─── Yahoo Finance (US Stocks) ─── */

let cachedCrumb: string | null = null;
let cachedCookie: string | null = null;
let crumbExpiresAt = 0;

async function getYahooCrumb(): Promise<{ crumb: string; cookie: string }> {
    const now = Date.now();
    if (cachedCrumb && cachedCookie && now < crumbExpiresAt) {
        return { crumb: cachedCrumb, cookie: cachedCookie };
    }

    const initRes = await fetch("https://fc.yahoo.com", {
        headers: { "User-Agent": UA },
        redirect: "manual",
    });
    const rawCookies = initRes.headers.getSetCookie?.() ?? [];
    const cookieStr = rawCookies.map((c) => c.split(";")[0]).join("; ");

    const crumbRes = await fetch(
        "https://query2.finance.yahoo.com/v1/test/getcrumb",
        {
            headers: { "User-Agent": UA, Cookie: cookieStr },
        }
    );

    if (!crumbRes.ok) throw new Error("Failed to get Yahoo crumb");
    const crumb = await crumbRes.text();

    cachedCrumb = crumb;
    cachedCookie = cookieStr;
    crumbExpiresAt = now + CRUMB_TTL_MS;

    return { crumb, cookie: cookieStr };
}

function buildYahooSymbol(symbol: string): string {
    const normalized = symbol.trim().toUpperCase();
    if (INDEX_MAP[normalized]) return INDEX_MAP[normalized];
    if (
        US_STOCKS.has(normalized) ||
        normalized.startsWith("^") ||
        normalized.endsWith(".NS") ||
        normalized.endsWith(".BO")
    )
        return normalized;
    return `${normalized}.NS`;
}

async function fetchYahooOptions(rawSymbol: string, dateParam: string) {
    const yahooSymbol = buildYahooSymbol(rawSymbol);
    const { crumb, cookie } = await getYahooCrumb();

    let url = `https://query2.finance.yahoo.com/v7/finance/options/${encodeURIComponent(yahooSymbol)}?crumb=${encodeURIComponent(crumb)}`;
    if (dateParam) url += `&date=${encodeURIComponent(dateParam)}`;

    let res = await fetch(url, {
        headers: { "User-Agent": UA, Cookie: cookie },
        cache: "no-store",
    });

    if (res.status === 401) {
        // Retry once with new crumb
        cachedCrumb = null;
        cachedCookie = null;
        crumbExpiresAt = 0;
        const freshAuth = await getYahooCrumb();
        let retryUrl = `https://query2.finance.yahoo.com/v7/finance/options/${encodeURIComponent(yahooSymbol)}?crumb=${encodeURIComponent(freshAuth.crumb)}`;
        if (dateParam) retryUrl += `&date=${encodeURIComponent(dateParam)}`;
        res = await fetch(retryUrl, {
            headers: { "User-Agent": UA, Cookie: freshAuth.cookie },
            cache: "no-store",
        });
    }

    if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);
    const data = await res.json();
    const result = data.optionChain?.result?.[0];

    if (!result || !result.options || result.options.length === 0) {
        throw new Error("No option chain data found on Yahoo Finance");
    }

    const quote = result.quote ?? {};
    const optionsData = result.options[0];

    const formatContract = (c: any): OptionContract => ({
        contractSymbol: c.contractSymbol ?? "",
        strike: c.strike ?? 0,
        lastPrice: c.lastPrice ?? 0,
        change: Number((c.change ?? 0).toFixed(2)),
        percentChange: Number((c.percentChange ?? 0).toFixed(2)),
        volume: c.volume ?? 0,
        openInterest: c.openInterest ?? 0,
        bid: c.bid ?? 0,
        ask: c.ask ?? 0,
        impliedVolatility: Number(((c.impliedVolatility ?? 0) * 100).toFixed(2)),
        inTheMoney: c.inTheMoney ?? false,
        expiration: c.expiration ?? 0,
        lastTradeDate: c.lastTradeDate ?? 0,
    });

    // Calculate day range properties if missing
    const open = quote.regularMarketOpen ?? 0;
    let dayHigh = quote.regularMarketDayHigh ?? open;
    let dayLow = quote.regularMarketDayLow ?? open;

    // If price is higher than high or lower than low, adjust (realtime glitch fix)
    if (quote.regularMarketPrice > dayHigh) dayHigh = quote.regularMarketPrice;
    if (quote.regularMarketPrice < dayLow && dayLow > 0) dayLow = quote.regularMarketPrice;

    return {
        underlying: {
            symbol: quote.symbol ?? yahooSymbol,
            name: quote.longName ?? quote.shortName ?? rawSymbol,
            price: quote.regularMarketPrice ?? 0,
            change: Number((quote.regularMarketChange ?? 0).toFixed(2)),
            changePercent: Number((quote.regularMarketChangePercent ?? 0).toFixed(2)),
            dayHigh: dayHigh,
            dayLow: dayLow,
            open: open,
            previousClose: quote.regularMarketPreviousClose ?? 0,
            volume: quote.regularMarketVolume ?? 0,
            currency: quote.currency ?? "USD",
        },
        expirationDates: (result.expirationDates ?? []).map((ts: number) => ({
            timestamp: ts,
            date: new Date(ts * 1000).toISOString().slice(0, 10),
            label: new Date(ts * 1000).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
        })),
        strikes: result.strikes ?? [],
        calls: (optionsData.calls ?? []).map(formatContract),
        puts: (optionsData.puts ?? []).map(formatContract),
        currentExpiry: optionsData.expirationDate
            ? new Date(optionsData.expirationDate * 1000).toISOString().slice(0, 10)
            : null,
        timestamp: new Date().toISOString(),
    };
}

/* ─── Groww (Indian Stocks) ─── */

async function fetchGrowwOptions(rawSymbol: string, dateParam: string) {
    const isIndex = INDIAN_INDICES.has(rawSymbol.toUpperCase().replace(" 50", ""));
    const cleanSymbol = rawSymbol.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Groww has different endpoints for indices vs equities
    let searchUrl = isIndex
        ? `https://groww.in/v1/api/option_chain_service/v1/option_chain/${cleanSymbol}?expiry=`
        : `https://groww.in/v1/api/option_chain_service/v1/option_chain/${cleanSymbol}?expiry=`;

    if (dateParam) {
        // If date is a unix timestamp (from UI clicks), convert to YYYY-MM-DD
        const isTimestamp = /^\d+$/.test(dateParam);
        if (isTimestamp) {
            const d = new Date(parseInt(dateParam) * 1000);
            searchUrl += `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        } else {
            searchUrl += dateParam;
        }
    }

    const res = await fetch(searchUrl, {
        headers: { "User-Agent": UA },
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`Groww API returned ${res.status}`);
    const data = await res.json();

    const optionChainNodes = data.optionChain?.optionChains || data.optionChainConfig?.optionChains || [];
    const expiryDetails = data.optionChain?.expiryDetailsDto || data.optionChain?.expiryDetails || data.optionChainConfig?.expiryDetailsDto || {};
    const datesList = expiryDetails.expireDates || [];

    if (!optionChainNodes || optionChainNodes.length === 0) {
        throw new Error("No option chain data found on Groww");
    }

    // Determine current expiry date string handling differences
    let currentExpiryDateStr = expiryDetails.currentExpiry || "";
    let currentExpiryTs = 0;
    if (currentExpiryDateStr) {
        currentExpiryTs = Math.floor(new Date(currentExpiryDateStr).getTime() / 1000);
    } else if (datesList.length > 0) {
        currentExpiryDateStr = datesList[0];
        currentExpiryTs = Math.floor(new Date(currentExpiryDateStr).getTime() / 1000);
    }

    // Get underlying price from the CE of ATM or the first quote we can find.
    // Groww gives `ltp`, `close`, `low` properties inside callOption but not a dedicated underlying block inline.
    // The closest ATM strike usually has similar CE/PE values, but we can just fetch Yahoo for underlying quote
    // to get accurate day high/low/volume, or parse it.

    // To ensure the UI component's contract schema matches, we'll map them:
    const calls: OptionContract[] = [];
    const puts: OptionContract[] = [];
    const strikes: number[] = [];

    // We'll calculate a pseudo-underlying price if yahoo fails
    let spotPrice = 0;

    for (const node of optionChainNodes) {
        const strike = node.strikePrice;
        strikes.push(strike);

        if (node.callOption) {
            const c = node.callOption;
            spotPrice = c.underlyingOptPrice || spotPrice;
            const isITM = spotPrice > strike;
            calls.push({
                contractSymbol: `CE_${strike}`,
                strike,
                lastPrice: c.ltp ?? 0,
                change: Number((c.dayChange ?? 0).toFixed(2)),
                percentChange: Number((c.dayChangePerc ?? 0).toFixed(2)),
                volume: c.volume ?? 0,
                openInterest: c.openInterest ?? 0,
                bid: c.bidPrice ?? 0,
                ask: c.askPrice ?? 0,
                impliedVolatility: Number((c.impliedVolatility ?? 0).toFixed(2)),
                inTheMoney: isITM,
                expiration: currentExpiryTs,
                lastTradeDate: Date.now(),
            });
        }

        if (node.putOption) {
            const p = node.putOption;
            spotPrice = p.underlyingOptPrice || spotPrice;
            const isITM = spotPrice < strike;
            puts.push({
                contractSymbol: `PE_${strike}`,
                strike,
                lastPrice: p.ltp ?? 0,
                change: Number((p.dayChange ?? 0).toFixed(2)),
                percentChange: Number((p.dayChangePerc ?? 0).toFixed(2)),
                volume: p.volume ?? 0,
                openInterest: p.openInterest ?? 0,
                bid: p.bidPrice ?? 0,
                ask: p.askPrice ?? 0,
                impliedVolatility: Number((p.impliedVolatility ?? 0).toFixed(2)),
                inTheMoney: isITM,
                expiration: currentExpiryTs,
                lastTradeDate: Date.now(),
            });
        }
    }

    // Fetch true underlying from Yahoo FInance if possible to complement data
    let underlying: UnderlyingInfo = {
        symbol: rawSymbol.toUpperCase(),
        name: rawSymbol.toUpperCase(),
        price: spotPrice,
        change: 0,
        changePercent: 0,
        dayHigh: spotPrice,
        dayLow: spotPrice,
        open: spotPrice,
        previousClose: spotPrice,
        volume: 0,
        currency: "INR",
    };

    try {
        const yahooSymbol = buildYahooSymbol(rawSymbol);
        const yReq = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`, {
            headers: { "User-Agent": UA },
            cache: "no-store",
        });
        if (yReq.ok) {
            const yData = await yReq.json();
            const meta = yData.chart?.result?.[0]?.meta;
            if (meta) {
                underlying = {
                    symbol: meta.symbol,
                    name: rawSymbol.toUpperCase(),
                    price: meta.regularMarketPrice ?? spotPrice,
                    change: meta.regularMarketPrice - meta.chartPreviousClose,
                    changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
                    dayHigh: meta.regularMarketDayHigh ?? meta.regularMarketPrice,
                    dayLow: meta.regularMarketDayLow ?? meta.regularMarketPrice,
                    open: meta.regularMarketOpen ?? meta.chartPreviousClose,
                    previousClose: meta.chartPreviousClose ?? spotPrice,
                    volume: meta.regularMarketVolume ?? 0,
                    currency: "INR"
                };
            }
        }
    } catch (e) {
        // Ignore Yahoo failure and use spotPrice from options
    }

    const expirationDates = datesList.map((dStr: string) => {
        // "2026-03-26" -> timestamp
        const ts = Math.floor(new Date(dStr).getTime() / 1000);
        return {
            timestamp: ts,
            date: dStr,
            label: new Date(dStr).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
        };
    });

    return {
        underlying,
        expirationDates,
        strikes,
        calls,
        puts,
        currentExpiry: currentExpiryDateStr,
        timestamp: new Date().toISOString(),
    };
}


/* ─── Route handler ─── */

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get("symbol")?.trim();
    const dateParam = searchParams.get("date")?.trim() ?? "";

    if (!rawSymbol) {
        return Response.json(
            { success: false, error: "Query parameter 'symbol' is required" },
            { status: 400 }
        );
    }

    try {
        const normalized = rawSymbol.toUpperCase();
        const isUS = US_STOCKS.has(normalized);

        let data;
        if (isUS) {
            // Direct to Yahoo Finance
            data = await fetchYahooOptions(rawSymbol, dateParam);
        } else {
            // Indian stock/index, use Groww
            try {
                data = await fetchGrowwOptions(rawSymbol, dateParam);
            } catch (err) {
                console.warn("Groww failed, falling back to Yahoo Finance for " + rawSymbol, err);
                // Attempt fallback to Yahoo (though options usually won't exist for .NS)
                data = await fetchYahooOptions(rawSymbol, dateParam);
            }
        }

        return Response.json({ success: true, data }, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
                "Content-Type": "application/json",
            },
        });

    } catch (error: any) {
        console.error("Error fetching option chain:", error.message);
        return Response.json(
            { success: false, error: "Failed to fetch option chain data or format is unavailable" },
            { status: 500 }
        );
    }
}
