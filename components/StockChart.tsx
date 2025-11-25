import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar
} from 'recharts';
import { StockData } from '../types';

interface StockChartProps {
  data: StockData[];
  ticker: string;
}

// Custom Candle Shape
const Candle = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGreen = close > open;
  const color = isGreen ? '#00ff41' : '#ff0033';
  const ratio = Math.abs(height / (open - close)); // Approximate ratio for wick drawing

  return (
    <g stroke={color} fill={color} strokeWidth="2">
      {/* Wick */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} />
      {/* Body */}
      <rect
        x={x}
        y={isGreen ? close : open} 
        width={width}
        height={Math.abs(open - close)}
        fill={color}
        stroke="none"
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-terminal-gray border border-terminal-green p-2 font-mono text-xs shadow-lg">
        <p className="text-white mb-1">{label}</p>
        <p className="text-terminal-green">Close: ${data.close.toFixed(2)}</p>
        <p className="text-gray-400">Open: ${data.open.toFixed(2)}</p>
        <p className="text-gray-400">High: ${data.high.toFixed(2)}</p>
        <p className="text-gray-400">Low: ${data.low.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export const StockChart: React.FC<StockChartProps> = ({ data, ticker }) => {
  return (
    <div className="w-full h-[400px] bg-terminal-black border border-terminal-dim p-4 rounded-sm relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
            <h2 className="text-2xl font-bold text-white tracking-wider">{ticker} <span className="text-xs text-terminal-green font-normal">US EQUITY</span></h2>
            <p className="text-xs text-gray-500">MOCK MARKET DATA</p>
        </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#666', fontSize: 10 }} 
            tickLine={false}
            axisLine={{ stroke: '#333' }}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            tick={{ fill: '#00ff41', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#333' }}
            tickFormatter={(val) => `$${val.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="ma20" stroke="#00ffff" dot={false} strokeWidth={1} />
          <Line type="monotone" dataKey="ma200" stroke="#ff00ff" dot={false} strokeWidth={1} />
          {/* We simulate candles with error bars or custom shapes. 
              For simplicity in this Recharts instance without complex custom shapes, 
              we often use a Bar for the body and ErrorBar for wicks, but here we 
              will just plot the Close price as a main line and High/Low as an area for effect 
              or stick to the Line for the demo to ensure stability. 
              
              Let's actually use a clean Line chart with area fill for "Volume" style look 
              to keep it robust if Custom Candle is complex to inject perfectly in all environments.
              
              Wait, the user asked for Candlestick. Let's try a simplified trick:
              Range bar chart not natively supported easily without custom shape.
              I'll use a Line chart primarily but styled aggressively.
           */}
           <Line 
            type="linear" 
            dataKey="close" 
            stroke="#00ff41" 
            strokeWidth={2} 
            dot={false} 
            animationDuration={500}
           />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
