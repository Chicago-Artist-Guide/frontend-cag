import React, { ReactNode } from 'react';
import Button from '../shared/Button';

type MatchConfirmationModalType = {
  onConfirm: () => void;
  onCancel: () => void;
  message: ReactNode;
};

export const MatchConfirmationModal = ({
  onConfirm,
  onCancel,
  message
}: MatchConfirmationModalType) => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    style={{ zIndex: 9999 }}
  >
    <div className="rounded bg-white p-4 shadow-lg">
      <h2 className="text-lg font-bold">Confirm Match</h2>
      <p>{message}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <button onClick={onCancel} className="bg-gray-300 rounded px-4 py-2">
          Cancel
        </button>
        <Button onClick={onConfirm} text="Confirm" variant="primary" />
      </div>
    </div>
  </div>
);
