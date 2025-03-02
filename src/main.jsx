import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import './TraeTheme.css';

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("React error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: '#333' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Try to render the app
try {
  console.log('Starting React application...');
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    console.log('Root element found, creating React root');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('Rendering AppRouter component');
    root.render(
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    );
    
    console.log('React render called successfully');
  } else {
    console.error('Root element not found in the DOM');
  }
} catch (error) {
  console.error('Fatal error starting React:', error);
  document.body.innerHTML += `<div style="padding: '20px', color: 'white', backgroundColor: '#333'"><h1>React Error</h1><p>${error.message}</p></div>`;
}
