import React from 'react';
import styled from 'styled-components';
import { useUserContext } from '../../../context/UserContext';
import { useStaffAuth } from '../../../hooks/useStaffAuth';
import { useSimpleAnalytics } from '../../../hooks/useSimpleAnalytics';
import { colors } from '../../../theme/styleVars';

const DebugContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    color: ${colors.slate};
    margin-bottom: 1rem;
  }

  .debug-item {
    padding: 0.5rem;
    margin: 0.5rem 0;
    background: ${colors.bodyBg};
    border-radius: 4px;
    font-family: monospace;

    strong {
      color: ${colors.mint};
    }
  }

  .error {
    background: #ffebee;
    color: #c62828;
  }

  .success {
    background: #e8f5e9;
    color: #2e7d32;
  }
`;

const DebugAuth: React.FC = () => {
  const { currentUser, account, profile } = useUserContext();
  const { isStaff, staffEmail } = useStaffAuth();
  const simpleData = useSimpleAnalytics();

  return (
    <DebugContainer>
      <h3>🔍 Authentication Debug Info</h3>

      <div className="debug-item">
        <strong>Current User:</strong> {currentUser?.email || 'Not logged in'}
      </div>

      <div className="debug-item">
        <strong>User UID:</strong> {currentUser?.uid || 'N/A'}
      </div>

      <div className="debug-item">
        <strong>Account Ref:</strong> {account?.ref ? 'Present' : 'Missing'}
      </div>

      <div className="debug-item">
        <strong>Profile Ref:</strong> {profile?.ref ? 'Present' : 'Missing'}
      </div>

      <div className={`debug-item ${isStaff ? 'success' : 'error'}`}>
        <strong>Staff Access:</strong>{' '}
        {isStaff ? '✓ Authorized' : '✗ Not Authorized'}
      </div>

      <div className="debug-item">
        <strong>Staff Email Check:</strong> {staffEmail || 'N/A'}
      </div>

      <h3>📊 Simple Analytics Test</h3>

      {simpleData.loading && <div className="debug-item">Loading...</div>}

      {simpleData.error && (
        <div className="debug-item error">
          <strong>Error:</strong> {simpleData.error}
        </div>
      )}

      {!simpleData.loading && !simpleData.error && (
        <>
          <div className="debug-item success">
            <strong>✓ Firestore Access Working!</strong>
          </div>
          <div className="debug-item">
            <strong>Accounts:</strong> {simpleData.accountCount}
          </div>
          <div className="debug-item">
            <strong>Profiles:</strong> {simpleData.profileCount}
          </div>
        </>
      )}
    </DebugContainer>
  );
};

export default DebugAuth;
