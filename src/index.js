import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { supabase } from './utils/supabaseClient';

// Verify Supabase connection
// supabase.from('*').on('*', payload => {
//   console.log('Change received!', payload)
// }).subscribe()

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(); 