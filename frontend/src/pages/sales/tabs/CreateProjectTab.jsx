import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { SectionCard } from '../../../components/common/SectionCard';
import { createProject } from '../../../api/services/projectService';
import { useNotification } from '../../../context/NotificationContext';
import { MOCK_SKILLS } from '../../../mocks/skills';

export function CreateProjectTab({ clients = [], onSuccess }) {
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    name: '',
    clientName: 'BMC Software',
    domain: 'Workload Automation',
    startDate: '2026-12-01',
    dueDate: '2027-11-30',
    budget: '',
    managerId: 'emp-mgr-1',
    managerName: 'Durgadas Barhate',
    description: '',
    technologies: ['Control-M', 'Python', 'React'],
  });

  const [documents, setDocuments] = useState([
    { id: '1', name: 'Draft_SOW.pdf', type: 'SOW' },
  ]);

  const [docType, setDocType] = useState('PRD');
  const [techInput, setTechInput] = useState('');

  const managers = [
    { id: 'emp-mgr-1', name: 'Durgadas Barhate' },
    { id: 'emp-8', name: 'Manager B' },
    { id: 'emp-15', name: 'Manager C' },
    { id: 'emp-14', name: 'Manager D' },
  ];

  const handleAddTech = (techName) => {
    if (!form.technologies.includes(techName)) {
      setForm((prev) => ({ ...prev, technologies: [...prev.technologies, techName] }));
    }
  };

  const handleRemoveTech = (techName) => {
    setForm((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== techName),
    }));
  };

  const handleAddDocument = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments([...documents, { id: String(Date.now()), name: file.name, type: docType }]);
    }
  };

  const handleRemoveDocument = (id) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.dueDate) < new Date(form.startDate)) {
      showNotification('Due date must be greater than or equal to start date.', 'error');
      return;
    }

    try {
      await createProject({
        ...form,
        budget: Number(form.budget),
        documents,
      });
      showNotification(`Project created. ${form.managerName} has been notified.`, 'success');
      onSuccess && onSuccess();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <SectionCard
      title="Create Won Project (SA-1, SA-2, SA-3)"
      subtitle="Register a new contract, set deadlines, upload PRD/SOW documents, and assign the project manager."
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Project Name"
              required
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. BMC Multi-Cloud Migration"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Client"
              required
              fullWidth
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            >
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Due Date (≥ Start Date)"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Contract Budget (₹)"
              type="number"
              required
              fullWidth
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="e.g. 5000000"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Assign Project Manager"
              required
              fullWidth
              value={form.managerId}
              onChange={(e) => {
                const mgr = managers.find((m) => m.id === e.target.value);
                setForm({ ...form, managerId: e.target.value, managerName: mgr?.name || '' });
              }}
            >
              {managers.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Technology Needed */}
          <Grid item xs={12}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1 }}>
              TECHNOLOGY NEEDED (CLICK TO ADD)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              {MOCK_SKILLS.slice(0, 10).map((s) => (
                <Chip
                  key={s.id}
                  label={s.name}
                  clickable
                  color={form.technologies.includes(s.name) ? 'primary' : 'default'}
                  onClick={() =>
                    form.technologies.includes(s.name)
                      ? handleRemoveTech(s.name)
                      : handleAddTech(s.name)
                  }
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Project Scope & Executive Summary"
              multiline
              rows={3}
              fullWidth
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Overview of scope, deliverables, and SLA targets..."
            />
          </Grid>

          {/* Document Upload */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Documents (PRD, MOM, SOW, Other)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <TextField
                select
                size="small"
                label="Doc Type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                sx={{ width: 140 }}
              >
                <MenuItem value="PRD">PRD</MenuItem>
                <MenuItem value="MOM">MOM</MenuItem>
                <MenuItem value="SOW">SOW</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>
                Attach File
                <input type="file" hidden onChange={handleAddDocument} />
              </Button>
            </Box>

            {documents.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {documents.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      p: 1.25,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={doc.type} size="small" />
                      <Typography variant="body2">{doc.name}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoveDocument(doc.id)} color="error">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary" size="large">
            Create Project & Notify Manager
          </Button>
        </Box>
      </Box>
    </SectionCard>
  );
}

export default CreateProjectTab;

