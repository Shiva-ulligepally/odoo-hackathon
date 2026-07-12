'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/hooks/useTheme';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export interface PieChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  height?: string;
}

export default function PieChart({ data, height = '300px' }: PieChartProps) {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setResolvedTheme(isDark ? 'dark' : 'light');
  }, [theme]);

  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#4b5563';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#f3f4f6' : '#1f2937',
        fontFamily: 'Inter, sans-serif',
      },
      padding: [10, 14],
      borderRadius: 8,
      formatter: '{b}: <b>{c}</b> ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: '0',
      left: 'center',
      textStyle: {
        color: textColor,
        fontFamily: 'Inter, sans-serif',
      },
      icon: 'circle',
    },
    series: [
      {
        name: 'ESG Breakdown',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#0f172a' : '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        data: data.map((d) => ({
          value: d.value,
          name: d.name,
          itemStyle: {
            color: d.color,
          },
        })),
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
