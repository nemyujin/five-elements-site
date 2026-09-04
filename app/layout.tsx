import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '5 Elements — 오늘의 균형을 찾는 리추얼',
  description: '오행의 균형 철학으로 오늘의 나를 관찰하고 작은 행동을 시작하는 디지털 리추얼.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
