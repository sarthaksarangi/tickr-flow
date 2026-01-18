'use server'

import {formatArticle, getDateRange, validateArticle} from "@/lib/utils";

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINHUB_API_KEY;

export async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {

    const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
        ? {cache: 'force-cache', next: {revalidate: revalidateSeconds}}
        : {cache: 'no-store'}

    const res = await fetch(url, options);

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch Failed, status: ${res.status}, statusText: ${text}`);
    }

    return (await res.json()) as T;

}

export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
    try {

        const range = getDateRange(5);
        const token = NEXT_PUBLIC_FINNHUB_API_KEY;
        const cleanSymbols = (symbols || [])
            .map(s => s?.trim().toUpperCase())
            .filter((s): s is string => Boolean(s));

        const maxArticles = 6;

        if (cleanSymbols.length > 0) {
            const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

            await Promise.all(
                cleanSymbols.map(async (symbol) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${range.from}&to=${range.to}&token=${token}`;

                        const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
                        perSymbolArticles[symbol] = (articles || []).filter(validateArticle)

                    } catch (e) {
                        console.error(`Error fetching company news for ${symbol}: ${e}`);
                        perSymbolArticles[symbol] = [];
                    }
                })
            );

            const collected: MarketNewsArticle[] = [];

            //Round-robin to pick the articles

            for (let round = 0; round < maxArticles; round++) {
                for (let i = 0; i < cleanSymbols.length; i++) {
                    const symbol = cleanSymbols[i];
                    const list = perSymbolArticles[symbol] || [];
                    if (list.length === 0) continue;
                    const article = list.shift();
                    if (!article || !validateArticle(article)) continue;

                    collected.push(formatArticle(article, true, symbol, round));
                    if (collected.length >= maxArticles) {
                        break;
                    }
                }
                if (collected.length >= maxArticles) break;
            }

            if (collected.length > 0) {
                collected.sort((a, b) => ((b.datetime || 0) - (a.datetime || 0)))
                return collected.slice(0, maxArticles);
            }
        }


        // General market news fallback or when no symbols provided
        const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
        const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

        const seen = new Set<string>();
        const unique: RawNewsArticle[] = [];
        for (const art of general || []) {
            if (!validateArticle(art)) continue;
            const key = `${art.id}-${art.url}-${art.headline}`;
            if (seen.has(key)) continue;
            seen.add(key);
            unique.push(art);
            if (unique.length >= 20) break; // cap early before final slicing
        }

        const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
        return formatted;

    } catch (err) {
        console.error('getNews error:', err);
        throw new Error('Failed to fetch news');
    }
}