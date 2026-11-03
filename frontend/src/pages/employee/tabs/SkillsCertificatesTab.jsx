import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { SKILL_LEVEL } from '../../../constants/statuses';
import { useNotification } from '../../../context/NotificationContext';
import { MOCK_SKILLS } from '../../../mocks/skills';

export function SkillsCertificatesTab({ employeeSkills = [], certificates = [] }) {
  const { showNotification } = useNotification();
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [learningSummary, setLearningSummary] = useState('');

  const [skillsList, setSkillsList] = useState([
    { id: '1', name: 'Python', level: 2, years: 3 },
    { id: '2', name: 'React', level: 2, years: 2.5 },
    { id: '3', name: 'PostgreSQL', level: 2, years: 2 },
  ]);

  const [newSkill, setNewSkill] = useState({ skillId: 'skl-1', level: 2, years: 2 });
  const [newCert, setNewCert] = useState({ title: '', skillName: 'Python' });

  const handleAddSkill = (e) => {
    e.preventDefault();
    const found = MOCK_SKILLS.find((s) => s.id === newSkill.skillId);
    setSkillsList([
      ...skillsList,
      { id: String(Date.now()), name: found?.name || 'Skill', level: newSkill.level, years: newSkill.years },
    ]);
    showNotification('Skill profile updated', 'success');
    setSkillDialogOpen(false);
  };

  const handleSaveLearning = (e) => {
    e.preventDefault();
    if (!learningSummary.trim()) return;
    showNotification('Monthly learning log saved for November 2026', 'success');
    setLearningSummary('');
  };

  const skillColumns = [
    { field: 'name', headerName: 'Skill Name', minWidth: 160 },
    {
      field: 'level',
      headerName: 'Proficiency Level',
      minWidth: 140,
      renderCell: (row) => SKILL_LEVEL[row.level] || 'Intermediate',
    },
    {
      field: 'years',
      headerName: 'Experience',
      minWidth: 120,
      renderCell: (row) => `${row.years} yrs`,
    },
  ];

  const certColumns = [
    { field: 'title', headerName: 'Certificate Title', minWidth: 200 },
    { field: 'skillName', headerName: 'Associated Skill', minWidth: 140 },
    {
      field: 'status',
      headerName: 'Verification',
      minWidth: 130,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
  ];

  return (
    <Box>
      {/* 1. Skills Profile */}
      <SectionCard
        title="My Skills Matrix"
        subtitle="Keep your skills and proficiency levels updated for automated project matching."
        noPadding
        actions={
          <Button variant="outlined" size="small" onClick={() => setSkillDialogOpen(true)}>
            + Add / Update Skill
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <DataTable columns={skillColumns} rows={skillsList} />
      </SectionCard>

      {/* 2. Certificates */}
      <SectionCard
        title="Certifications & Credentials"
        subtitle="Self-reported certificates verified by Team Leads and HR."
        noPadding
        actions={
          <Button variant="outlined" size="small" onClick={() => setCertDialogOpen(true)}>
            Upload Certificate
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <DataTable columns={certColumns} rows={(certificates || []).slice(0, 2)} />
      </SectionCard>

      {/* 3. Monthly Learning Entry */}
      <SectionCard title="Monthly Learning Log (November 2026)">
        <Box component="form" onSubmit={handleSaveLearning}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Document courses completed, new tools adopted, or domain research conducted this month.
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder="e.g. Completed React 18 Suspense & Server Components deep dive, investigated Control-M API webhooks..."
            value={learningSummary}
            onChange={(e) => setLearningSummary(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={!learningSummary.trim()}>
            Save Monthly Log
          </Button>
        </Box>
      </SectionCard>

      {/* Add Skill Dialog */}
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddSkill}>
          <DialogTitle sx={{ fontWeight: 600 }}>Add Skill to Profile</DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Skill"
              fullWidth
              sx={{ mb: 2, mt: 1 }}
              value={newSkill.skillId}
              onChange={(e) => setNewSkill({ ...newSkill, skillId: e.target.value })}
            >
              {MOCK_SKILLS.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Proficiency Level"
              fullWidth
              sx={{ mb: 2 }}
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: Number(e.target.value) })}
            >
              <MenuItem value={1}>1 — Beginner</MenuItem>
              <MenuItem value={2}>2 — Intermediate</MenuItem>
              <MenuItem value={3}>3 — Expert</MenuItem>
            </TextField>
            <TextField
              label="Years of Experience"
              type="number"
              fullWidth
              inputProps={{ step: 0.5, min: 0 }}
              value={newSkill.years}
              onChange={(e) => setNewSkill({ ...newSkill, years: Number(e.target.value) })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setSkillDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Upload Certificate Dialog */}
      <Dialog open={certDialogOpen} onClose={() => setCertDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Upload Certificate</DialogTitle>
        <DialogContent>
          <TextField
            label="Certificate Title"
            fullWidth
            required
            sx={{ mb: 2, mt: 1 }}
            value={newCert.title}
            onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
            placeholder="e.g. AWS Certified Developer"
          />
          <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5 }}>
            Select PDF / Image File
            <input type="file" hidden accept=".pdf,.png,.jpg" />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCertDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              showNotification('Certificate uploaded for verification', 'success');
              setCertDialogOpen(false);
            }}
            variant="contained"
            color="primary"
          >
            Submit Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SkillsCertificatesTab;

