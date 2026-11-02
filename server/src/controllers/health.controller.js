export function getHealth(req, res) {
  res.status(200).json({
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    error: null
  });
}

