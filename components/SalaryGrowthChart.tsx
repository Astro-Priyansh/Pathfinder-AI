import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';

interface ProjectionData {
  year: string;
  salary: number;
}

interface SalaryGrowthChartProps {
  projections: ProjectionData[];
  currencySymbol?: string;
  themeColor?: string;
}

export const SalaryGrowthChart: React.FC<SalaryGrowthChartProps> = ({
  projections,
  currencySymbol = '$',
  themeColor = '#db2777' // Pink-600
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);
  const height = 220;
  const margin = { top: 20, right: 25, bottom: 35, left: 65 };
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: ProjectionData } | null>(null);

  // Measure container for true responsive fluid layout
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    // Initial size
    setWidth(containerRef.current.getBoundingClientRect().width || 400);
    
    return () => resizeObserver.disconnect();
  }, []);

  if (!projections || projections.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-400">No projection data available</p>
      </div>
    );
  }

  // Set up d3 scales
  const innerWidth = Math.max(100, width - margin.left - margin.right);
  const innerHeight = Math.max(50, height - margin.top - margin.bottom);

  const xScale = d3.scalePoint<string>()
    .domain(projections.map(d => d.year))
    .range([0, innerWidth]);

  const minSalary = (d3.min(projections, (d: ProjectionData) => d.salary) as number) ?? 0;
  const maxSalary = (d3.max(projections, (d: ProjectionData) => d.salary) as number) ?? 100000;
  const buffer = (maxSalary - minSalary) * 0.15 || 10000;

  // Ensure y starts slightly below minimum to highlight growth
  const yScale = d3.scaleLinear()
    .domain([Math.max(0, minSalary - buffer), maxSalary + buffer])
    .range([innerHeight, 0]);

  // Create the line generator
  const lineGenerator = d3.line<ProjectionData>()
    .x(d => xScale(d.year) || 0)
    .y(d => yScale(d.salary))
    .curve(d3.curveMonotoneX);

  // Create the area under the line generator
  const areaGenerator = d3.area<ProjectionData>()
    .x(d => xScale(d.year) || 0)
    .y0(innerHeight)
    .y1(d => yScale(d.salary))
    .curve(d3.curveMonotoneX);

  const pathD = lineGenerator(projections) || '';
  const areaD = areaGenerator(projections) || '';

  // Calculate ticks for gridlines
  const yTicks = yScale.ticks(5);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `${currencySymbol}${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}k`;
    return `${currencySymbol}${val}`;
  };

  return (
    <div id="salary-projection-box" className="w-full bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/60 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase text-pink-600 dark:text-pink-400 tracking-wider">Salary Growth Trend</span>
          <span className="text-[10px] text-gray-400 font-medium">5-Year compound projection model</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700/55">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-pulse"></span>
          Est. Max: {formatCurrency(maxSalary)}
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-visible relative">
        <svg width={width} height={height} className="overflow-visible select-none">
          <defs>
            {/* Gradient below line */}
            <linearGradient id={`gradient-${themeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={themeColor} stopOpacity={0.0} />
            </linearGradient>
            
            {/* Soft shadow for the trendline */}
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={themeColor} floodOpacity="0.25" />
            </filter>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Gridlines */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={0}
                  y1={yScale(tick)}
                  x2={innerWidth}
                  y2={yScale(tick)}
                  stroke="currentColor"
                  strokeOpacity={0.06}
                  className="text-gray-500 dark:text-gray-400"
                  strokeDasharray="3 3"
                />
                <text
                  x={-10}
                  y={yScale(tick) + 4}
                  textAnchor="end"
                  className="text-[10px] font-bold font-mono text-gray-400 fill-current"
                >
                  {formatCurrency(tick)}
                </text>
              </g>
            ))}

            {/* X-axis ticks */}
            {projections.map((d, i) => {
              const xCoord = xScale(d.year) || 0;
              return (
                <g key={i} transform={`translate(${xCoord}, 0)`}>
                  <line
                    x1={0}
                    y1={innerHeight}
                    x2={0}
                    y2={innerHeight + 6}
                    stroke="currentColor"
                    strokeOpacity={0.2}
                    className="text-gray-400"
                  />
                  <text
                    x={0}
                    y={innerHeight + 18}
                    textAnchor="middle"
                    className="text-[10px] font-bold text-gray-400 dark:text-gray-500 fill-current"
                  >
                    {d.year}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill */}
            <path
              d={areaD}
              fill={`url(#gradient-${themeColor.replace('#', '')})`}
              className="transition-all duration-300"
            />

            {/* Core Trend Line */}
            <path
              d={pathD}
              fill="none"
              stroke={themeColor}
              strokeWidth={3}
              strokeLinecap="round"
              filter="url(#shadow)"
              className="transition-all duration-300"
            />

            {/* Interactive Data Points */}
            {projections.map((d, i) => {
              const cx = xScale(d.year) || 0;
              const cy = yScale(d.salary);
              const isActive = hoveredPoint?.data.year === d.year;

              return (
                <g key={i}>
                  {/* Invisible larger hover zone */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={18}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredPoint({ x: cx, y: cy, data: d });
                    }}
                    onMouseLeave={() => {
                      setHoveredPoint(null);
                    }}
                  />
                  
                  {/* Outer circle decoration on active */}
                  {isActive && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={9}
                      fill={themeColor}
                      fillOpacity={0.15}
                      className="transition-all duration-150 pointer-events-none"
                    />
                  )}

                  {/* Inner standard circle point */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 5 : 3.5}
                    fill={isActive ? themeColor : '#ffffff'}
                    stroke={themeColor}
                    strokeWidth={isActive ? 2 : 2}
                    className="transition-all duration-150 pointer-events-none shadow"
                    style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.15))" }}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* HTML Tooltip Overlay inside container */}
        {hoveredPoint && (
          <div
            className="absolute z-10 p-2.5 bg-gray-900 dark:bg-gray-950 text-white text-xs font-bold rounded-xl shadow-xl border border-gray-800 transition-all pointer-events-none flex flex-col gap-0.5"
            style={{
              left: `${hoveredPoint.x + margin.left - 60}px`,
              top: `${hoveredPoint.y + margin.top - 62}px`,
              width: '120px',
            }}
          >
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">{hoveredPoint.data.year}</div>
            <div className="text-pink-400 font-black text-center text-sm">
              {formatCurrency(hoveredPoint.data.salary)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
