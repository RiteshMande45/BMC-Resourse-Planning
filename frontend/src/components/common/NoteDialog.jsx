import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export function NoteDialog({
  open,
  title = 'Reason required',
  prompt = 'Please provide an explanatory note before proceeding.',
  placeholder = 'Type your note here...',
  minLength = 5,
  confirmLabel = 'Submit',
  confirmColor = 'primary',
  onClose,
  onSubmit,
}) {
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setNote('');
      setTouched(false);
    }
  }, [open]);

  const isValid = note.trim().length >= minLength;

  const handleSubmit = () => {
    setTouched(true);
    if (isValid) {
      onSubmit(note.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {prompt}
        </Typography>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          error={touched && !isValid}
          helperText={
            touched && !isValid
              ? `Note must be at least ${minLength} characters.`
              : `${note.trim().length}/${minLength} characters min`
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={confirmColor}
          disabled={!isValid}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NoteDialog;

