import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Box, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Button, Grid, Card, CardContent 
} from '@mui/material';
import { getProjects, getAllocations } from '../services/api';

const ResourceDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const projRes = await getProjects();
            const allocRes = await getAllocations();
            setProjects(projRes.data);
            setAllocations(allocRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                BMC Resource Planning Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Total Projects</Typography>
                            <Typography variant="h5">{projects.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Active Allocations</Typography>
                            <Typography variant="h5">{allocations.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Resource Allocations Overview
            </Typography>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Resource Name</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Allocation (%)</strong></TableCell>
                            <TableCell><strong>Assigned Project ID</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allocations.length > 0 ? (
                            allocations.map((alloc) => (
                                <TableRow key={alloc.id}>
                                    <TableCell>{alloc.resource_name}</TableCell>
                                    <TableCell>{alloc.role}</TableCell>
                                    <TableCell>{alloc.percent}%</TableCell>
                                    <TableCell>{alloc.project_id}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No allocations found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ResourceDashboard;
