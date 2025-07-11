const express = require('express');
   const axios = require('axios');
   const path = require('path');
   const app = express();
   const port = process.env.PORT || 3000;

   app.use(express.json());
   app.use(express.static(__dirname));

   app.post('/api/backtest', async (req, res) => {
       const { api, nodes, edges } = req.body;

       try {
           let data;
           if (api === 'alpaca') {
               const Alpaca = require('@alpaca/alpaca-trade-api');
               const alpaca = new Alpaca({
                   keyId: process.env.ALPACA_KEY,
                   secretKey: process.env.ALPACA_SECRET,
                   paper: true,
               });
               data = await alpaca.getBarsV2('AAPL', { timeframe: '1Min', limit: 1000 });
           } else if (api === 'polygon') {
               const response = await axios.get(
                   `https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/minute/2023-01-01/2023-12-31?apiKey=${process.env.POLYGON_KEY}`
               );
               data = response.data.results;
           }

           // Sample backtest results (extend with real data processing as needed)
           const results = {
               trades: [],
               performance: {
                   winRate: 0.65,
                   sharpeRatio: 1.2,
                   maxDrawdown: 0.05,
                   returns: Array(100).fill(0).map((_, i) => ({
                       date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
                       value: Math.random() * 100
                   }))
               },
           };

           // Process nodes and edges to simulate backtest logic
           const operatorNode = nodes.find((n) => n.type === 'operator');
           const variableNode = nodes.find((n) => n.type === 'variable');
           const actionNode = nodes.find((n) => n.type === 'action');
           const stockNode = nodes.find((n) => n.type === 'stock');

           if (operatorNode && variableNode && actionNode && stockNode) {
               const condition = operatorNode.data.operator.replace('_', ' ');
               const variable = variableNode.data.type === 'custom' ? variableNode.data.value : `${variableNode.data.value}${variableNode.data.type === 'percent' ? '%' : ''}`;
               const action = actionNode.data.action;
               const stock = stockNode.data.stock === 'single' ? stockNode.data.symbol : 'universe';

               results.trades.push({
                   symbol: stock === 'universe' ? 'MULTIPLE' : stock,
                   action,
                   condition: `${condition} ${variable}`,
                   timestamp: new Date().toISOString(),
               });
           }

           res.json(results);
       } catch (error) {
           res.status(500).json({ error: 'Backtest failed', details: error.message });
       }
   });

   app.get('/', (req, res) => {
       res.sendFile(path.join(__dirname, 'index.html'));
   });

   app.listen(port, () => {
       console.log(`Server running on port ${port}`);
   });
