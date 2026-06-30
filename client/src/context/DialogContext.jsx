import React, { createContext, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'primary'
  });

  const showDialog = useCallback(({ title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = 'primary' }) => {
    setDialogState({
      open: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      confirmColor
    });
  }, []);

  const handleClose = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = () => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    handleClose();
  };

  return (
    <DialogContext.Provider value={showDialog}>
      {children}
      <Dialog
        open={dialogState.open}
        onClose={handleClose}
        PaperProps={{
          sx: { borderRadius: 3, padding: 1 }
        }}
      >
        {dialogState.title && <DialogTitle>{dialogState.title}</DialogTitle>}
        <DialogContent>
          <DialogContentText>{dialogState.message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingRight: 2, paddingBottom: 2 }}>
          <Button onClick={handleClose} color="inherit">
            {dialogState.cancelText}
          </Button>
          <Button onClick={handleConfirm} color={dialogState.confirmColor} variant="contained" autoFocus>
            {dialogState.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
};
