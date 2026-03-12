import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = import.meta.env.VITE_API_TARGET || 'http://10.93.26.90:42002';
const API_TOKEN_KEY = 'api_token';

interface ScoreData {
  bucket: string;
  count: number;
}

interface TimelineData {
  date: string;
  submissions: number;
}

interface PassRateData {
  task: string;
  avg_score: number;
  attempts: number;
}

const Dashboard: React.FC = () => {
  const [lab, setLab] = useState<string>('lab-04');
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [passRates, setPassRates] = useState<PassRateData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem(API_TOKEN_KEY) || '';

  useEffect(() => {
    if (!token) {
      setError('No API token found');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [scoresRes, timelineRes, passRatesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/scores?lab=${lab}`, { headers }),
          fetch(`${API_BASE_URL}/analytics/timeline?lab=${lab}`, { headers }),
          fetch(`${API_BASE_URL}/analytics/pass-rates?lab=${lab}`, { headers })
        ]);

        if (!scoresRes.ok || !timelineRes.ok || !passRatesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const scoresData: ScoreData[] = await scoresRes.json();
        const timelineData: TimelineData[] = await timelineRes.json();
        const passRatesData: PassRateData[] = await passRatesRes.json();

        setScores(scoresData);
        setTimeline(timelineData);
        setPassRates(passRatesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lab, token]);

  const scoreChartData = {
    labels: scores.map(s => s.bucket),
    datasets: [
      {
        label: 'Score Distribution',
        data: scores.map(s => s.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      }
    ]
  };

  const timelineChartData = {
    labels: timeline.map(t => t.date),
    datasets: [
      {
        label: 'Submissions',
        data: timeline.map(t => t.submissions),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Analytics Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Lab:
          <select 
            value={lab} 
            onChange={(e) => setLab(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="lab-04">Lab 04</option>
            <option value="lab-05">Lab 05</option>
          </select>
        </label>
      </div>

      {scores.length > 0 && (
        <>
          <h2>Score Distribution</h2>
          <Bar data={scoreChartData} />
        </>
      )}

      {timeline.length > 0 && (
        <>
          <h2>Timeline</h2>
          <Line data={timelineChartData} />
        </>
      )}

      {passRates.length > 0 && (
        <>
          <h2>Pass Rates</h2>
          <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Avg Score</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {passRates.map((pr, index) => (
                <tr key={index}>
                  <td>{pr.task}</td>
                  <td>{pr.avg_score}</td>
                  <td>{pr.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Dashboard;
