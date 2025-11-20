import Dashboard from './pages/Dashboard';
import Ideas from './pages/Ideas';
import Posts from './pages/Posts';
import WordPress from './pages/WordPress';
import Profile from './pages/Profile';
import LLMTest from './pages/LLMTest';
import EditPost from './pages/EditPost';
import __Layout from './Layout.jsx';


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