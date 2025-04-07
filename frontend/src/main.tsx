import React from 'react'
import './index.css';
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import ReactDOM from 'react-dom/client';
import ListSkins from './screens/ListSkins';
import PreviewSkin from './screens/PreviewSkin';
import Home from './screens/Home';



const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/find_skins", element: <ListSkins />},
        { path: "/preview_skin/:id", element: <PreviewSkin />}
      ]
    }
  ]);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
  
