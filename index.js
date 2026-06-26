const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.all('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('url b da');
    }

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.method !== 'GET' ? req.body : undefined,
            headers: { 
                ...req.headers, 
                host: new URL(targetUrl).host 
            },
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType);

        res.send(response.data);
    } catch (error) {
        const statusCode = error.response ? error.response.status : 500;
        const errorMessage = error.response ? error.response.data : error.message;
        
        res.status(statusCode).send(errorMessage);
    }
});

const PORT = 3000;
app.listen(PORT);
