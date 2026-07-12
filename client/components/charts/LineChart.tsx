'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/hooks/useTheme';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export interface SeriesData {
  name: string;
  data: number[];
  color?: string;
  type?: 'line' | 'bar';
  areaStyle?: boolean;
}

export interface LineChartProps {
  xData: string[] | number[];
  series: SeriesData[];
  xAxisName?: string;
  yAxisName?: string;
  height?: string;
}

export default function LineChart({
  xData,
  series,
  xAxisName,
  yAxisName = 'tCO2e',
  height = '300px',
}: LineChartProps) {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setResolvedTheme(isDark ? 'dark' : 'light');
  }, [theme]);

  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#4b5563';
  const splitLineColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#f3f4f6' : '#1f2937',
        fontFamily: 'Inter, sans-serif',
      },
      padding: [10, 14],
      borderRadius: 8,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowBlur: 10,
      formatter: function (params: any) {
        let tooltipHtml = `<div style="font-weight: 600; margin-bottom: 6px;">${params[0].axisValue}</div>`;
        params.forEach((item: any) => {
          const valueFormatted = new Intl.NumberFormat('en-US').format(item.value);
          tooltipHtml += `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; font-size: 12px; margin-top: 4px;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${item.color};"></span>
                <span style="color: ${isDark ? '#9ca3af' : '#6b7280'}">${item.seriesName}</span>
              </span>
              <span style="font-weight: 600;">${valueFormatted} ${yAxisName}</span>
            </div>
          `;
        });
        return tooltipHtml;
      },
    },
    legend: {
      show: true,
      textStyle: {
        color: textColor,
        fontFamily: 'Inter, sans-serif',
      },
      top: 0,
      icon: 'circle',
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '5%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xData,
      name: xAxisName,
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: textColor,
        fontFamily: 'Inter, sans-serif',
        margin: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameTextStyle: {
        color: textColor,
        fontFamily: 'Inter, sans-serif',
        padding: [0, 0, 8, 0],
      },
      splitLine: {
        lineStyle: {
          color: splitLineColor,
        },
      },
      axisLabel: {
        color: textColor,
        fontFamily: 'Inter, sans-serif',
        formatter: function (value: number) {
          if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'k';
          }
          return value.toString();
        },
      },
    },
    series: series.map((s) => ({
      name: s.name,
      type: s.type || 'line',
      data: s.data,
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 3,
        color: s.color,
      },
      itemStyle: {
        color: s.color,
      },
      areaStyle: s.areaStyle
        ? {
            color: s.color
              ? {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: s.color },
                    { offset: 1, color: 'transparent' },
                  ],
                }
              : undefined,
            opacity: 0.15,
          }
        : undefined,
    })),
  };

  return (
    <div className="w-full" style={{ height }}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
