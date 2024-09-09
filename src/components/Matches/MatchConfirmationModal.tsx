import React from 'react';

export const MatchConfirmationModal = ({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    style={{ zIndex: 9999 }}
  >
    <div className="rounded bg-white p-4 shadow-lg">
      <h2 className="text-lg font-bold">Confirm Match</h2>
      <p>
        Are you sure you want to accept this match? This action will create a
        message thread with [name]
      </p>
      <div className="mt-4 flex justify-end space-x-2">
        <button onClick={onCancel} className="bg-gray-300 rounded px-4 py-2">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);
