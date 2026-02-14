import React from 'react';
import { confirmable, createConfirmation, ConfirmableProps } from 'react-confirm';

export interface MyDialogProps extends ConfirmableProps {
  show: boolean;
  message: string;
}

const MyDialog: React.FC<MyDialogProps> = ({ show, proceed, message }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
    aria-describedby="confirm-dialog-description"
    className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      } bg-black/50`}
  >
    <div className="bg-card rounded-2xl shadow-lg p-8 min-w-[320px] max-w-[90vw] text-center border border-border">
      <h2
        id="confirm-dialog-title"
        className="text-2xl font-bold text-foreground mb-2"
      >
        Confirm Deletion
      </h2>
      <p
        id="confirm-dialog-description"
        className="mb-6 text-muted-foreground"
      >
        {message}
      </p>
      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-2 rounded-md bg-destructive text-white font-semibold hover:bg-destructive/90 transition"
          onClick={() => proceed(true)}
          autoFocus
        >
          Yes, Delete
        </button>
        <button
          className="px-6 py-2 rounded-md bg-muted text-foreground font-semibold border border-border hover:bg-muted/80 transition"
          onClick={() => proceed(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);



export const confirm = createConfirmation(confirmable(MyDialog));
