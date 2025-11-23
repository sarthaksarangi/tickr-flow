'use client'
import React, {useEffect, useRef, memo} from 'react';
import useTradingViewWidget from "@/Hooks/UseTradingViewWidget";
import {cn} from "@/lib/utils";

interface TradinfViewWidgetProps {
    title?: string;
    scriptUrl: string;
    config: Record<string, unknown>;
    height?: number;
    className?: string;

}

function TradingViewWidget({title, scriptUrl, config, height = 600, className}: TradinfViewWidgetProps) {
    const containerRef = useTradingViewWidget(scriptUrl, config, height);


    return (
        <div className='w-full'>
            {title && <h3 className={'font-semibold text-2xl text-gray-100 mb-5'}>{title} </h3>}

            <div className="tradingview-widget-container" ref={containerRef}>
                <div className={cn("tradingview-widget-container__widget", className)}
                     ref={containerRef}
                     style={{height: height, width: "100%"}}></div>

            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
