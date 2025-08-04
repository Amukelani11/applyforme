'use client';

import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

function McpEditScriptContent() {
  const searchParams = useSearchParams();
  const editMode = searchParams.get('mcp-edit-mode');

  if (editMode === 'true') {
    return <Script src="/click-to-edit.js" strategy="lazyOnload" />;
  }

  return null;
}

export default function McpEditScript() {
  return (
    <Suspense fallback={null}>
      <McpEditScriptContent />
    </Suspense>
  );
}
