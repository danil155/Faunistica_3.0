import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { FormProvider } from './pages/FormContext';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <FormProvider>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </FormProvider>
    </React.StrictMode>
);

reportWebVitals();