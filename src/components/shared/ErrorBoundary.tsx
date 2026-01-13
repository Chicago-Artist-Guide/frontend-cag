import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../../theme/styleVars';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details in development mode only
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
      console.error('Full error object:', error);
      console.error('Error info:', errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <>
          {this.props.children}
          <Modal
            backdrop="static"
            show={this.state.hasError}
            onHide={this.handleDismiss}
            className="z-3"
            centered
          >
            <Modal.Header>
              <Modal.Title>
                <Title>Something Went Wrong</Title>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ErrorMessage>
                An unexpected error occurred. Please refresh the page to
                continue.
              </ErrorMessage>
              {import.meta.env.DEV && this.state.error && (
                <DevErrorDetails>
                  <DevErrorTitle>Development Error Details:</DevErrorTitle>
                  <DevErrorText>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </DevErrorText>
                  {this.state.error.stack && (
                    <DevErrorStack>
                      <strong>Stack:</strong>
                      <pre>{this.state.error.stack}</pre>
                    </DevErrorStack>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <DevErrorStack>
                      <strong>Component Stack:</strong>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </DevErrorStack>
                  )}
                </DevErrorDetails>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleRefresh}>
                Refresh Page
              </Button>
              <Button variant="secondary" onClick={this.handleDismiss}>
                Dismiss
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      );
    }

    return this.props.children;
  }
}

const Title = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const ErrorMessage = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 16px;
  line-height: 24px;
  color: ${colors.mainFont};
  margin-bottom: 0;
`;

const DevErrorDetails = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: ${colors.lightestGrey};
  border: 1px solid ${colors.lightGrey};
  border-radius: 4px;
  font-family: ${fonts.mainFont};
  font-size: 12px;
`;

const DevErrorTitle = styled.h4`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  color: ${colors.dark};
`;

const DevErrorText = styled.div`
  margin-bottom: 12px;
  color: ${colors.dark};
  word-break: break-word;
`;

const DevErrorStack = styled.div`
  margin-top: 12px;
  color: ${colors.dark};

  pre {
    margin-top: 8px;
    padding: 8px;
    background-color: ${colors.white};
    border: 1px solid ${colors.lightGrey};
    border-radius: 4px;
    font-size: 11px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

export default ErrorBoundary;
