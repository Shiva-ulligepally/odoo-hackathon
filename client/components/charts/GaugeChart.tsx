'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/hooks/useTheme';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export interface GaugeChartProps {
  value: number;
  title: string;
  color?: string;
  min?: number;
  max?: number;
  height?: string;
}

export default function GaugeChart({
  value,
  title,
  color = '#10b981',
  min = 0,
  max = 100,
  height = '300px',
}: GaugeChartProps) {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setResolvedTheme(isDark ? 'dark' : 'light');
  }, [theme]);

  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#4b5563';

  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min,
        max,
        radius: '90%',
        center: ['50%', '65%'],
        pointer: {
          show: true,
          length: '60%',
          width: 5,
          itemStyle: {
            color: textColor,
          },
        },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            color,
          },
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, isDark ? '#1e293b' : '#e2e8f0']],
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: true,
          distance: -20,
          color: textColor,
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
        },
        data: [
          {
            value,
            name: title,
            title: {
              offsetCenter: [0, '25%'],
              color: textColor,
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 600,
            },
            detail: {
              offsetCenter: [0, '-10%'],
              valueAnimation: true,
              formatter: '{value}',
              color: isDark ? '#ffffff' : '#0f172a',
              fontSize: 32,
              fontWeight: 'bold',
              fontFamily: 'Inter, sans-serif',
            },
          },
        ],
      },
    ],
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
