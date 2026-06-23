import './App.css'
import { Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-gray-500">
      <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-emerald-600 animate-spin" />
      <span className="text-sm font-medium">Loading…</span>
    </div>
  </div>
);

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : () => <div>No pages configured</div>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ErrorBoundary>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={
                  <LayoutWrapper currentPageName={mainPageKey}>
                    <MainPage />
                  </LayoutWrapper>
                } />
                {Object.entries(Pages).map(([path, Page]) => (
                  <Route
                    key={path}
                    path={`/${path}`}
                    element={
                      <LayoutWrapper currentPageName={path}>
                        <Page />
                      </LayoutWrapper>
                    }
                  />
                ))}
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </ErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
