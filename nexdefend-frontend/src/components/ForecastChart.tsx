import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aiApi } from '../api/ai';
import type { ForecastPoint } from '../api/ai';
import { Box, Card, Typography, Select, MenuItem, FormControl } from '@mui/material';

const ForecastChart: React.FC = () => {
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [metric, setMetric] = useState('cpu_load');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const forecast = await aiApi.getForecast(metric);
        setData(forecast);
      } catch (err) {
        console.error("Failed to load forecast", err);
      }
    };
    fetchData();
  }, [metric]);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return `${date.getHours()}:00`;
  };

  return (
    <Card sx={{ bgcolor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
          AI Resource Prediction (24h)
        </Typography>
        <FormControl size="small">
            <Select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              sx={{
                height: 30,
                fontSize: '0.875rem',
                color: 'text.secondary',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                '.MuiSvgIcon-root': { color: 'text.secondary' }
              }}
            >
              <MenuItem value="cpu_load">CPU Load</MenuItem>
              <MenuItem value="memory_usage">Memory Usage</MenuItem>
            </Select>
        </FormControl>
      </Box>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00D1FF"
              strokeWidth={2}
              dot={false}
              name="Predicted Usage %"
              activeDot={{ r: 6, fill: '#00D1FF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default ForecastChart;
