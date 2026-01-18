'use client'
import {
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandList,

} from "@/components/ui/command"

import React, {Fragment, useEffect, useState} from 'react'
import {Button} from "@/components/ui/button";
import {Loader, TrendingUp} from "lucide-react";
import Link from "next/link";
import {searchStocks} from "@/lib/actions/finhub.actions";
import {useDebounce} from "@/Hooks/useDebounce";

export const SearchCommand = ({renderAs = 'button', label = 'Add stock', initialStocks}: SearchCommandProps) => {

    const [open, setOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [stocks, setStocks] = useState(initialStocks);

    const isSearchMode = !!searchTerm.trim();
    const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            console.log(e)
            if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open)
            }
        }

        window.addEventListener("keydown", down);
        return () => window.removeEventListener("keydown", down);
    }, [])

    const handleSearch = async () => {
        if (!isSearchMode) return setStocks(initialStocks);
        setLoading(true);
        try {
            const results = await searchStocks(searchTerm.trim());
            setStocks(results);

        } catch (err) {
            console.log(err);
            setStocks([]);
        } finally {
            setLoading(false);
        }
    }

    const deboucedSearch = useDebounce(handleSearch, 300);

    useEffect(() => {
        deboucedSearch()
    }, [searchTerm]);

    const handleSelectStock = () => {
        setOpen(false);
        setSearchTerm("");
        setStocks(initialStocks);
    }

    return (
        <>
            {renderAs === 'text' ? (
                <span onClick={() => setOpen(open => !open)} className={'search-text'}> {label} </span>
            ) : (<Button onClick={() => setOpen(open => !open)} className={'search-btn'}>
                {label}
            </Button>)}


            <CommandDialog open={open} onOpenChange={setOpen}>
                <div className="search-field">
                    <CommandInput className={'search-input'} placeholder="Search by symbol or company name"
                                  value={searchTerm}
                                  onValueChange={setSearchTerm}/>
                    {loading && <Loader className={'search-loader'}/>}
                </div>
                <CommandList className={'search-list'}>
                    {loading ? (
                            <CommandEmpty className={'search-list-empty'}>Loading stocks..</CommandEmpty>
                        ) :
                        displayStocks?.length === 0 ? (
                            <div className="search-list-indicator">
                                {isSearchMode ? 'No results found.' : 'No stocks available.'}
                            </div>
                        ) : (
                            <ul>
                                <div className={'search-count'}>
                                    {isSearchMode ? 'Search results ' : 'Popular Stocks '}
                                    {` `}({displayStocks?.length || 0})
                                </div>

                                {displayStocks?.map((stock, i) => {

                                        return <li key={stock.symbol} className={'search-item'}>
                                            <Link
                                                href={`/stocks/${stock.symbol}`}
                                                onClick={handleSelectStock}
                                                className='search-item-link'
                                            >
                                                <TrendingUp className={"h-4 w-4 text-gray-500"}/>
                                                <div className="flex-1">
                                                    <div className="search-item-name">
                                                        {stock.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {stock.symbol} | {stock.exchange} | {stock.type}
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>

                                    }
                                )}
                            </ul>
                        )
                    }

                </CommandList>
            </CommandDialog>

        </>
    )
}
export default SearchCommand

