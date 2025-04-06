import React from 'react'
import './index.css';
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';
import ReactDOM from 'react-dom/client';
import ListSkins from './ListSkins';



const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/find_skins", element: <ListSkins />}
      ]
    }
  ]);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
  
