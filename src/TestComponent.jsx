import React from 'react';

function TestComponent() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
      <h1>Test Component</h1>
      <p>If you can see this, basic React rendering is working!</p>
      <button 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#ff4757', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </button>
    </div>
  );
}

export default TestComponent; 