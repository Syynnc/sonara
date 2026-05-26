'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  BarElement, BarController,
  CategoryScale, LinearScale,
  RadarController, RadialLinearScale, PointElement, LineElement,
  DoughnutController, ArcElement,
  Tooltip, Legend, Filler,
} from 'chart.js';

// Register only what we use — keeps bundle small
Chart.register(
  BarElement, BarController,
  CategoryScale, LinearScale,
  RadarController, RadialLinearScale, PointElement, LineElement,
  DoughnutController, ArcElement,
  Tooltip, Legend, Filler,
);

// ── Shared theme helpers ──────────────────────────────────────────────────────
const ORANGE      = '#FF5500';
const ORANGE_DIM  = 'rgba(255,85,0,0.18)';
const ORANGE_MID  = 'rgba(255,85,0,0.55)';
const GRID_LINE   = 'rgba(255,255,255,0.05)';
const TICK_COLOR  = 'rgba(255,255,255,0.28)';
const FONT_FAMILY = 'inherit';

// ── Popularity Bar Chart ──────────────────────────────────────────────────────
export interface PopBucket {
  label: string;
  range: string;
  count: number;
}

export function PopularityBarChart({ buckets }: { buckets: PopBucket[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();

    const counts = buckets.map((b) => b.count);
    const total  = counts.reduce((s, c) => s + c, 0) || 1;

    chartRef.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: buckets.map((b) => b.label),
        datasets: [{
          label: 'Tracks',
          data: counts,
          backgroundColor: counts.map((c) => {
            const ratio = c / Math.max(...counts, 1);
            return `rgba(255,85,0,${0.25 + ratio * 0.65})`;
          }),
          borderColor: counts.map((c) => {
            const ratio = c / Math.max(...counts, 1);
            return `rgba(255,85,0,${0.35 + ratio * 0.65})`;
          }),
          borderWidth: 1,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 64,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            padding: 10,
            titleColor: 'rgba(255,255,255,0.7)',
            bodyColor: ORANGE,
            titleFont: { family: FONT_FAMILY, size: 11, weight: 'bold' },
            bodyFont: { family: FONT_FAMILY, size: 12, weight: 'bold' },
            callbacks: {
              title: (items) => {
                const b = buckets[items[0].dataIndex];
                return `${b.label}  (${b.range})`;
              },
              label: (item) => {
                const c = item.raw as number;
                return ` ${c} track${c !== 1 ? 's' : ''}  ·  ${Math.round((c / total) * 100)}%`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: TICK_COLOR,
              font: { family: FONT_FAMILY, size: 10.5, weight: 500 as const },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: GRID_LINE },
            border: { display: false, dash: [3, 3] },
            ticks: {
              color: TICK_COLOR,
              font: { family: FONT_FAMILY, size: 10 },
              stepSize: 1,
              precision: 0,
              callback: (v) => (Number(v) % 1 === 0 ? v : ''),
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [buckets]);

  return <canvas ref={ref} />;
}

// ── Audio Features Radar Chart ────────────────────────────────────────────────
export interface AudioFeaturesData {
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
}

export function AudioFeaturesRadar({ features }: { features: AudioFeaturesData }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();

    const labels = ['Energy', 'Dance', 'Mood', 'Acoustic', 'Instru.', 'Speech'];
    const data   = [
      features.energy,
      features.danceability,
      features.valence,
      features.acousticness,
      features.instrumentalness,
      features.speechiness,
    ].map((v) => Math.round(v * 100));

    chartRef.current = new Chart(ref.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'You',
          data,
          backgroundColor: ORANGE_DIM,
          borderColor: ORANGE,
          borderWidth: 1.5,
          pointBackgroundColor: ORANGE,
          pointBorderColor: 'transparent',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            padding: 10,
            titleColor: 'rgba(255,255,255,0.7)',
            bodyColor: ORANGE,
            titleFont: { family: FONT_FAMILY, size: 11, weight: 'bold' },
            bodyFont: { family: FONT_FAMILY, size: 12, weight: 'bold' },
            callbacks: {
              label: (item) => ` ${item.raw}/100`,
            },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            backgroundColor: 'transparent',
            grid: { color: GRID_LINE },
            angleLines: { color: 'rgba(255,255,255,0.06)' },
            pointLabels: {
              color: TICK_COLOR,
              font: { family: FONT_FAMILY, size: 10.5 },
            },
            ticks: {
              display: false,
              stepSize: 25,
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [features]);

  return <canvas ref={ref} />;
}

// ── Genre Doughnut Chart ──────────────────────────────────────────────────────
export interface GenreSlice {
  name: string;
  count: number;
  pct: number;
}

const PALETTE = [
  '#FF5500', '#FF7A3D', '#CC4400',
  '#FF9966', '#E84400', '#B84000',
];

export function GenreDoughnut({ genres }: { genres: GenreSlice[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current || !genres.length) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: genres.map((g) => g.name),
        datasets: [{
          data: genres.map((g) => g.count),
          backgroundColor: PALETTE.slice(0, genres.length),
          borderColor: '#0B0B0B',
          borderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            padding: 10,
            titleColor: 'rgba(255,255,255,0.7)',
            bodyColor: '#fff',
            titleFont: { family: FONT_FAMILY, size: 11, weight: 'bold' },
            bodyFont: { family: FONT_FAMILY, size: 11 },
            callbacks: {
              title: (items) => genres[items[0].dataIndex].name,
              label: (item) => {
                const g = genres[item.dataIndex];
                return `  ${Math.round(g.pct * 100)}% of your top artists`;
              },
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [genres]);

  return <canvas ref={ref} />;
}

// ── Track Popularity Horizontal Bar Chart ─────────────────────────────────────
export interface TrackPopEntry {
  id: string;
  name: string;
  artist: string;
  popularity: number;
}

export function TrackPopularityChart({ tracks }: { tracks: TrackPopEntry[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current || !tracks.length) return;
    chartRef.current?.destroy();

    const sorted = [...tracks].sort((a, b) => b.popularity - a.popularity);

    chartRef.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: sorted.map((t) => t.name),
        datasets: [{
          label: 'Popularity',
          data: sorted.map((t) => t.popularity),
          backgroundColor: sorted.map((t) => `rgba(255,85,0,${0.2 + (t.popularity / 100) * 0.65})`),
          borderColor:      sorted.map((t) => `rgba(255,85,0,${0.3 + (t.popularity / 100) * 0.65})`),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            padding: 10,
            titleColor: 'rgba(255,255,255,0.7)',
            bodyColor: ORANGE,
            titleFont: { family: FONT_FAMILY, size: 11, weight: 'bold' },
            bodyFont: { family: FONT_FAMILY, size: 12, weight: 'bold' },
            callbacks: {
              title: (items) => sorted[items[0].dataIndex].name,
              label: (item) => {
                const t = sorted[item.dataIndex];
                return ` ${t.popularity}/100  ·  ${t.artist}`;
              },
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: GRID_LINE },
            border: { display: false, dash: [3, 3] },
            ticks: {
              color: TICK_COLOR,
              font: { family: FONT_FAMILY, size: 10 },
              callback: (v) => `${v}`,
            },
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: TICK_COLOR,
              font: { family: FONT_FAMILY, size: 10.5, weight: 500 as const },
              maxRotation: 0,
              callback: (_v, i) => {
                const name = sorted[i]?.name ?? '';
                return name.length > 22 ? name.slice(0, 20) + '…' : name;
              },
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [tracks]);

  return <canvas ref={ref} />;
}
