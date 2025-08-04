'use client';

import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function McpEditScript() {
  const searchParams = useSearchParams();
  const editMode = searchParams.get('mcp-edit-mode');

  if (editMode === 'true') {
    return <Script src="/click-to-edit.js" strategy="lazyOnload" />;
  }

  return null;
}
