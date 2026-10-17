import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught a runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetData = () => {
    try {
      localStorage.clear();
      window.location.href = '/login';
    } catch (e) {
      console.error('Error clearing storage:', e);
      window.location.reload();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main, #f8fafc)',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              width: '100%',
              background: 'var(--bg-surface, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '36px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--text-primary, #0f172a)',
                marginBottom: '8px',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary, #64748b)',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}
            >
              A runtime error occurred in DailySpend. You can refresh the page or reset stored demo data to recover.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'var(--bg-surface-hover, #f1f5f9)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  color: '#dc2626',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '24px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Home size={16} />
                <span>Go to Dashboard</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetData}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
                <span>Reset Demo Storage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
