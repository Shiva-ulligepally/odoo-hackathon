'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/hooks/useTheme';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export interface BarChartProps {
  xData: string[] | number[];
  series: {
    name: string;
    data: number[];
    color?: string;
  }[];
  xAxisName?: string;
  yAxisName?: string;
  height?: string;
}

export default function BarChart({
  xData,
  series,
  xAxisName,
  yAxisName = 'tCO2e',
  height = '300px',
}: BarChartProps) {
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
      },
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      barMaxWidth: 30,
      itemStyle: {
        color: s.color,
        borderRadius: [4, 4, 0, 0],
      },
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
