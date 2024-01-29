'use strict';
const express = require('express');
const accepts = require('accepts');
const xml2js = require('xml2js');
const app = express();

// Endpoint to generate a large XML or JSON response based on "Accept" header, size, data configuration, and primary column
app.get('/large-response', async (req, res) => {
    try {
        // Create a function to determine the preferred response format
        const preferredFormat = accepts(req).type(['json', 'xml']);

        // Set appropriate headers based on the preferred format
        if (preferredFormat === 'xml') {
            res.setHeader('Content-Type', 'application/xml');
        } else {
            res.setHeader('Content-Type', 'application/json');
        }

        // Get the sizeInBytes, primary, and data configuration from the query parameters
        const sizeInBytes = parseInt(req.query.sizeInBytes) || 1024; // Default size: 1024 bytes
        const primary = req.query.primary || null; // Default primary column: null
        const dataConfig = JSON.parse(req.query.dataConfig || '{}'); // Default data configuration: {}

        // Generate a response until it meets or exceeds the specified size
        const largeResponse = await generateLargeResponse(sizeInBytes, preferredFormat, dataConfig, primary);

        // Send the response
        res.send(largeResponse);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to generate a readable stream of mock data based on data configuration
function generateDataStream(dataConfig, sizeInBytes, preferredFormat, primaryColumn) {
    const { Readable } = require('stream');
    let count = 0;

    // Implement a custom readable stream
    return new Readable({
        objectMode: true,
        async read() {
            // Stop streaming when the desired size is reached
            if (Buffer.from(JSON.stringify(dataConfig)).length * count >= sizeInBytes) {
                // Add the closing tag to complete the XML structure
                if (preferredFormat === 'xml' && count > 0) {
                    this.push('</Root>');
                }
                this.push(null);
            } else {
                // Ensure the primaryColumn is set to a default value if not provided
                const columnToRandomize = primaryColumn || 'id';

                // Randomize the data based on the dynamically configured primary column (if found)
                const randomizedData = randomizeData(dataConfig, columnToRandomize);

                // Stringify the data based on the preferred format
                const chunk = preferredFormat === 'xml' ? await convertJsonToXml(randomizedData, count === 0) : JSON.stringify(randomizedData);

                // Add the opening tag for the first XML chunk
                if (count === 0 && preferredFormat === 'xml') {
                    this.push('<Root>');
                }

                // Add a comma after each JSON chunk (except for the first one)
                if (preferredFormat === 'json' && count > 0) {
                    this.push(',');
                }

                this.push(chunk);
                count++;
            }
        }
    });
}

// Function to randomize data based on the dynamically configured primary column
function randomizeData(dataConfig, primary) {
    if (dataConfig.hasOwnProperty(primary)) {
        // Generate a random value for the dynamically configured primary column
        dataConfig[primary] = Math.floor(Math.random() * 1000);
    }

    return dataConfig;
}

// Function to generate a large response with mock data based on size (in bytes), data configuration, and primary column
async function generateLargeResponse(sizeInBytes, preferredFormat, dataConfig, primary) {
    return new Promise((resolve, reject) => {
        // Create a readable stream for the data configuration
        const stream = generateDataStream(dataConfig, sizeInBytes, preferredFormat, primary);

        // Create a buffer to collect the stream chunks
        const chunks = [];

        // Handle stream events
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(chunks.join('')));
        stream.on('error', (error) => reject(error));
    });
}

// Function to convert JSON to XML using xml2js
function convertJsonToXml(jsonData, isFirstChunk) {
    return new Promise((resolve, reject) => {
        const builder = new xml2js.Builder({
            rootName: 'Record',  // Set the root element name for each item
            headless: true,  // Do not include XML declaration in each chunk
            renderOpts: {
                pretty: false  // Do not format the XML for each chunk
            }
        });
        const xml = builder.buildObject(jsonData);
        resolve(xml.trim());
    });
}

// Start the server on port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
