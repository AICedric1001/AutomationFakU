const express = require('express');
const submitForm = require('./formSubmit');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main trigger endpoint
app.get('/', async (req, res) => {
    const startTime = new Date();
    console.log(`Form submission triggered at ${startTime.toISOString()}`);
    
    try {
        res.json({ 
            status: 'success', 
            message: 'Form submission started',
            timestamp: startTime.toISOString()
        });
        
        // Run the form submission in the background
        await submitForm();
        
        const endTime = new Date();
        const duration = endTime - startTime;
        console.log(`Form submission completed in ${duration}ms`);
        
    } catch (err) {
        console.error('Error running form submission:', err);
        
        // You might want to send a notification here
        // or log to a monitoring service
    }
});

// Alternative trigger endpoint (in case you want a different URL)
app.get('/submit', async (req, res) => {
    const startTime = new Date();
    console.log(`Form submission triggered via /submit at ${startTime.toISOString()}`);
    
    try {
        await submitForm();
        
        const endTime = new Date();
        const duration = endTime - startTime;
        
        res.json({ 
            status: 'success', 
            message: 'Form submitted successfully',
            duration: `${duration}ms`,
            timestamp: endTime.toISOString()
        });
        
    } catch (err) {
        console.error('Error running form submission:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Form submission failed',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📝 Form submission endpoint: http://localhost:${port}/`);
    console.log(`🏥 Health check: http://localhost:${port}/health`);
});
