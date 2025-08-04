'use client'

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Download, Eye, Loader2 } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title?: string;
  className?: string;
}

export const PDFViewer = ({ url, title = "PDF Document", className = "" }: PDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [viewMode, setViewMode] = useState<'iframe' | 'object'>('iframe');
  const [hasLoaded, setHasLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a timeout to stop loading after 10 seconds
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoadTimeout(true);
        setLoading(false); // Force stop loading
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, url, viewMode]);

  const handleLoad = () => {
    setLoading(false);
    setLoadTimeout(false);
    setHasLoaded(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleError = () => {
    setError('Failed to load PDF document');
    setLoading(false);
    setLoadTimeout(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title + '.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const switchToObjectView = () => {
    setViewMode('object');
    setLoading(true);
    setError(undefined);
    setLoadTimeout(false);
    setHasLoaded(false);
  };

  const switchToIframeView = () => {
    setViewMode('iframe');
    setLoading(true);
    setError(undefined);
    setLoadTimeout(false);
    setHasLoaded(false);
  };

  const forceStopLoading = () => {
    setLoading(false);
    setLoadTimeout(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  if (loading && !hasLoaded) {
    return (
      <div className={`flex items-center justify-center h-[600px] bg-white rounded-lg border ${className}`}>
        <div className="text-center space-y-6">
          <div className="relative">
            <FileText className="w-16 h-16 text-gray-300 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">
              {loadTimeout ? 'Document is taking longer than usual...' : 'Loading document...'}
            </p>
            <p className="text-sm text-gray-500">
              {loadTimeout 
                ? 'The file might be large. You can try alternative viewing options.'
                : 'Please wait while we prepare your document'
              }
            </p>
            {loadTimeout && (
              <div className="pt-4 space-y-2">
                <div className="flex justify-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={switchToObjectView}
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Try Object Viewer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownload}
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex justify-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.open(url, '_blank')}
                    className="text-xs"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in new tab
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={forceStopLoading}
                    className="text-xs"
                  >
                    Stop Loading
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-[600px] bg-white rounded-lg border ${className}`}>
        <div className="text-center space-y-6">
          <div className="p-4 rounded-full bg-gray-50">
            <FileText className="w-16 h-16 text-gray-400 mx-auto" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-900 font-semibold text-lg">Document could not be loaded</p>
              <p className="text-gray-600 text-sm mt-1">The file may be corrupted or in an unsupported format</p>
            </div>
            <div className="flex flex-col justify-center space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="hover:scale-105 transition-all duration-200"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="hover:scale-105 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(url, '_blank')}
                className="hover:scale-105 transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in new tab
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Document Controls */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <span className="text-xs text-gray-400">
            {viewMode === 'iframe' ? 'Browser View' : 'Object View'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={switchToIframeView}
            className={`hover:scale-105 transition-all duration-200 ${viewMode === 'iframe' ? 'bg-purple-50 border-purple-200' : ''}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Browser View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={switchToObjectView}
            className={`hover:scale-105 transition-all duration-200 ${viewMode === 'object' ? 'bg-purple-50 border-purple-200' : ''}`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Object View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="hover:scale-105 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="hover:scale-105 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            New Tab
          </Button>
        </div>
      </div>
      
      {/* Document Viewer */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
        {viewMode === 'iframe' ? (
          <iframe
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-[700px] border-0"
            onLoad={handleLoad}
            onError={handleError}
            title={title}
            onLoadStart={() => setLoading(true)}
          />
        ) : (
          <object
            data={url}
            type="application/pdf"
            className="w-full h-[700px]"
            onLoad={handleLoad}
            onError={handleError}
          >
            <div className="flex items-center justify-center h-[700px] bg-gray-50">
              <div className="text-center space-y-4">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-gray-600">PDF cannot be displayed in this browser</p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </object>
        )}
      </div>
    </div>
  );
}; 