import { lazy } from 'react';
import __Layout from './Layout.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Ideas = lazy(() => import('./pages/Ideas'));
const Posts = lazy(() => import('./pages/Posts'));
const WordPress = lazy(() => import('./pages/WordPress'));
const Profile = lazy(() => import('./pages/Profile'));
const LLMTest = lazy(() => import('./pages/LLMTest'));
const EditPost = lazy(() => import('./pages/EditPost'));

export const PAGES = {
    "Dashboard": Dashboard,
    "Ideas": Ideas,
    "Posts": Posts,
    "WordPress": WordPress,
    "Profile": Profile,
    "LLMTest": LLMTest,
    "EditPost": EditPost,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
