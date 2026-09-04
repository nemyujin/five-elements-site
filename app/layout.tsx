import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '5 Elements — 오행을 오늘의 행동으로',
  description: '사주에서 발견한 오행의 기본 구성과 지금의 목표를 연결해 오늘 실천할 하나의 리추얼을 제안합니다.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}

