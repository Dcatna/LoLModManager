import React from 'react'
import './index.css';
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';
import ReactDOM from 'react-dom/client';



const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        { path: "/", element: <Home /> }
      ]
    }
  ]);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
  
