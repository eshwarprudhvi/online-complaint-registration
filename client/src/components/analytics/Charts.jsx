import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#9c27b0', '#0288d1', '#e65100'];

const ChartWrapper = ({ title, children }) => (
  <Card sx={{ height: '100%', minHeight: 450, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 2 }}>
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, width: '100%' }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

export const ComplaintStatusChart = ({ data }) => {
  const formattedData = data?.map((d, i) => ({ id: i, value: d.count, label: d._id, color: COLORS[i % COLORS.length] })) || [];
  return (
    <ChartWrapper title="Complaints by Status">
      <PieChart
        series={[{ data: formattedData, innerRadius: 40, outerRadius: 100, paddingAngle: 2, cornerRadius: 4 }]}
        height={400}
        margin={{ top: 10, bottom: 20, left: 10, right: 10 }}
        slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: 0 } }}
      />
    </ChartWrapper>
  );
};

export const ComplaintCategoryChart = ({ data }) => {
  const formattedData = data?.map(d => ({ name: d._id, count: d.count })) || [];
  const xLabels = formattedData.map(d => d.name);
  const seriesData = formattedData.map(d => d.count);
  
  return (
    <ChartWrapper title="Complaints by Category">
      <BarChart
        xAxis={[{ scaleType: 'band', data: xLabels, tickLabelStyle: { angle: -45, textAnchor: 'end', fontSize: 10 } }]}
        series={[{ data: seriesData, color: COLORS[0], label: 'Complaints' }]}
        height={400}
        margin={{ top: 20, bottom: 60, left: 40, right: 20 }}
      />
    </ChartWrapper>
  );
};

export const ComplaintTrendChart = ({ data }) => {
  const formattedData = data?.map(d => ({
    name: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
    count: d.count
  })) || [];
  const xLabels = formattedData.map(d => d.name);
  const seriesData = formattedData.map(d => d.count);

  return (
    <ChartWrapper title="Monthly Complaint Trend">
      <LineChart
        xAxis={[{ scaleType: 'point', data: xLabels }]}
        series={[{ data: seriesData, area: true, showMark: true, color: COLORS[4], label: 'Complaints' }]}
        height={400}
        margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
      />
    </ChartWrapper>
  );
};

export const ResolutionChart = ({ data }) => {
  const formattedData = data?.map(d => ({
    name: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
    avgTimeDays: parseFloat((d.avgTime / (1000 * 60 * 60 * 24)).toFixed(2)),
    resolutions: d.count
  })) || [];
  const xLabels = formattedData.map(d => d.name);
  const seriesAvgTime = formattedData.map(d => d.avgTimeDays);
  const seriesResolutions = formattedData.map(d => d.resolutions);

  return (
    <ChartWrapper title="Resolution Trends">
      <LineChart
        xAxis={[{ scaleType: 'point', data: xLabels }]}
        series={[
          { data: seriesAvgTime, label: 'Avg Time (Days)', color: COLORS[1], showMark: true },
          { data: seriesResolutions, label: 'Resolutions', color: COLORS[2], showMark: true }
        ]}
        height={400}
        margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
      />
    </ChartWrapper>
  );
};

export const RoleDistributionChart = ({ data }) => {
  const formattedData = data?.map((d, i) => ({ id: i, value: d.count, label: d._id, color: COLORS[i % COLORS.length] })) || [];
  return (
    <ChartWrapper title="Role Distribution">
      <PieChart
        series={[{ data: formattedData, innerRadius: 60, outerRadius: 100, paddingAngle: 2, cornerRadius: 4 }]}
        height={400}
        margin={{ top: 10, bottom: 20, left: 10, right: 10 }}
        slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: 0 } }}
      />
    </ChartWrapper>
  );
};
