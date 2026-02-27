// Test NSE India API with proper cookie flow
async function testNSE() {
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

    try {
        // Step 1: Visit the option chain page directly to get proper cookies
        console.log('1. Fetching NSE option chain page...');
        const pageRes = await fetch('https://www.nseindia.com/option-chain', {
            headers: {
                'User-Agent': UA,
                'Accept': ACCEPT,
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
            },
            redirect: 'follow',
        });

        console.log('   Page status:', pageRes.status);
        const allCookies = pageRes.headers.getSetCookie?.() ?? [];
        console.log('   Cookie count:', allCookies.length);
        const cookieStr = allCookies.map(c => c.split(';')[0]).join('; ');
        console.log('   Cookie str:', cookieStr.substring(0, 150));

        // Step 2: Now fetch the API with those cookies  
        console.log('\n2. Fetching NIFTY option chain API...');
        const apiRes = await fetch('https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY', {
            headers: {
                'User-Agent': UA,
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.nseindia.com/option-chain',
                'Cookie': cookieStr,
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            },
        });

        console.log('   API status:', apiRes.status);

        if (apiRes.ok) {
            const text = await apiRes.text();
            console.log('   Response length:', text.length);

            if (text.length > 100) {
                const data = JSON.parse(text);
                const rec = data.records;
                console.log('\n--- SUCCESS ---');
                console.log('Underlying:', rec?.underlyingValue);
                console.log('Expiry dates:', rec?.expiryDates?.length, rec?.expiryDates?.slice(0, 3));
                console.log('Data rows:', rec?.data?.length);
                console.log('Strike prices:', rec?.strikePrices?.length);

                if (rec?.data?.[0]) {
                    const row = rec.data[0];
                    console.log('\nRow keys:', Object.keys(row));
                    console.log('strikePrice:', row.strikePrice);
                    console.log('expiryDate:', row.expiryDate);
                    if (row.CE) console.log('CE sample:', JSON.stringify({
                        strikePrice: row.CE.strikePrice,
                        openInterest: row.CE.openInterest,
                        changeinOpenInterest: row.CE.changeinOpenInterest,
                        totalTradedVolume: row.CE.totalTradedVolume,
                        impliedVolatility: row.CE.impliedVolatility,
                        lastPrice: row.CE.lastPrice,
                        change: row.CE.change,
                        bidprice: row.CE.bidprice,
                        askPrice: row.CE.askPrice,
                    }, null, 2));
                }
                console.log('\nNSE_SUCCESS');
            } else {
                console.log('   Response too short:', text.substring(0, 200));
            }
        } else {
            const text = await apiRes.text();
            console.log('   Error:', text.substring(0, 200));
        }
    } catch (e) {
        console.log('ERROR:', e.message);
    }
}

testNSE();
