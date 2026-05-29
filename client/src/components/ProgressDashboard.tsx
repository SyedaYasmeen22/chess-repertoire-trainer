import React, { useMemo } from 'react';
import { Repertoire } from '@/lib/chess-utils';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProgressDashboardProps {
  repertoires: Repertoire[];
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  repertoires,
}) => {
  const stats = useMemo(() => {
    const withAttempts = repertoires.filter(r => r.stats.attempts > 0);
    
    const totalAttempts = repertoires.reduce((sum, r) => sum + r.stats.attempts, 0);
    const totalSuccesses = repertoires.reduce((sum, r) => sum + r.stats.successes, 0);
    const overallAccuracy = totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 0;

    const difficultyBreakdown = {
      easy: repertoires.filter(r => r.stats.difficulty === 'easy').length,
      medium: repertoires.filter(r => r.stats.difficulty === 'medium').length,
      hard: repertoires.filter(r => r.stats.difficulty === 'hard').length,
    };

    const accuracyByRepertoire = withAttempts
      .sort((a, b) => b.stats.attempts - a.stats.attempts)
      .slice(0, 10)
      .map(r => ({
        name: r.name.length > 15 ? r.name.substring(0, 15) + '...' : r.name,
        accuracy: Math.round((r.stats.successes / r.stats.attempts) * 100),
        attempts: r.stats.attempts,
      }));

    const recentActivity = withAttempts
      .sort((a, b) => (b.stats.lastAttempt || 0) - (a.stats.lastAttempt || 0))
      .slice(0, 5)
      .map(r => ({
        name: r.name.length > 15 ? r.name.substring(0, 15) + '...' : r.name,
        accuracy: Math.round((r.stats.successes / r.stats.attempts) * 100),
      }));

    return {
      totalRepertoires: repertoires.length,
      totalAttempts,
      totalSuccesses,
      overallAccuracy,
      difficultyBreakdown,
      accuracyByRepertoire,
      recentActivity,
    };
  }, [repertoires]);

  const COLORS = ['#a8b89e', '#8b6f47', '#d97e6e'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-organic p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Repertoires</p>
          <p className="text-3xl font-bold text-primary">{stats.totalRepertoires}</p>
        </Card>
        <Card className="card-organic p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
          <p className="text-3xl font-bold text-primary">{stats.totalAttempts}</p>
        </Card>
        <Card className="card-organic p-4">
          <p className="text-sm text-muted-foreground mb-1">Successes</p>
          <p className="text-3xl font-bold text-secondary">{stats.totalSuccesses}</p>
        </Card>
        <Card className="card-organic p-4">
          <p className="text-sm text-muted-foreground mb-1">Overall Accuracy</p>
          <p className="text-3xl font-bold text-secondary">{stats.overallAccuracy}%</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <Card className="card-organic p-6">
          <h3 className="text-heading text-primary mb-4">Difficulty Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Easy', value: stats.difficultyBreakdown.easy },
                  { name: 'Medium', value: stats.difficultyBreakdown.medium },
                  { name: 'Hard', value: stats.difficultyBreakdown.hard },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Repertoires by Accuracy */}
        <Card className="card-organic p-6">
          <h3 className="text-heading text-primary mb-4">Top Repertoires</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.accuracyByRepertoire}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#8b6f47" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card className="card-organic p-6">
          <h3 className="text-heading text-primary mb-4">Recent Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.recentActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#8b6f47"
                strokeWidth={2}
                dot={{ fill: '#8b6f47', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Difficulty Breakdown Table */}
      <Card className="card-organic p-6">
        <h3 className="text-heading text-primary mb-4">Difficulty Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="font-semibold">Easy</span>
            <span className="text-2xl font-bold text-secondary">{stats.difficultyBreakdown.easy}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="font-semibold">Medium</span>
            <span className="text-2xl font-bold text-primary">{stats.difficultyBreakdown.medium}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="font-semibold">Hard</span>
            <span className="text-2xl font-bold text-destructive">{stats.difficultyBreakdown.hard}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
