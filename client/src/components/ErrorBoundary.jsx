import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleRerender = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#0a0e1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 9999,
        }}>
          <div style={{
            textAlign: 'center',
            color: '#a8c5dd',
            fontFamily: 'var(--mono)',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>
              RENDERING ERROR DETECTED
            </div>
            <div style={{ fontSize: '12px', color: '#7a98b8', marginBottom: '20px' }}>
              An error occurred while rendering the game.
            </div>
            <button
              onClick={this.handleRerender}
              style={{
                padding: '12px 24px',
                background: 'rgba(0, 150, 0, 0.3)',
                border: '1px solid #00cc00',
                color: '#00ff99',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 150, 0, 0.5)';
                e.target.style.boxShadow = '0 0 10px rgba(0, 255, 153, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 150, 0, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            >
              RERENDER
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginLeft: '10px',
                padding: '12px 24px',
                background: 'rgba(160, 80, 220, 0.2)',
                border: '1px solid #a080e0',
                color: '#d0b0ff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(160, 80, 220, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(160, 80, 220, 0.2)';
              }}
            >
              FULL RELOAD
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
