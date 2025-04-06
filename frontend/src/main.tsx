import React from 'react'
import {createRoot} from 'react-dom/client'
import './index.css';

import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';



const router = createBrowserRouter([
    {
      path: "/",
      element: <App />, // Your App wrapper component (ThemeProvider, Sidebar, etc.)
      children: [
        { path: "/", element: <Home /> }
      ]
    }
  ]);

    
const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)
