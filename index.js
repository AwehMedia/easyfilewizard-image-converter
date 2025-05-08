// Image Conversion API for EasyFileWizard

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Supported formats
const supportedFormats = ['jpg', 'png', 'gif', 'webp'];

// Image Conversion Endpoint
app.post('/convert', upload.single('image'), async (req, res) => {
    console.log('Uploaded file details:', req.file); // Log the uploaded file details
    const { format } = req.body;

    // Check if the format is supported
    if (!supportedFormats.includes(format)) {
        console.log('Unsupported format requested:', format);
        return res.status(400).send('Unsupported format');
    }

    // Define input and output file paths
    const inputFilePath = req.file.path;
    const outputFilePath = `uploads/${req.file.filename}.${format}`;

    try {
        console.log(`Starting conversion: ${inputFilePath} -> ${outputFilePath}`);
        
        // Convert the image using Sharp
        await sharp(inputFilePath)
            .toFormat(format)
            .toFile(outputFilePath);

        console.log('Conversion successful. Sending file back to client.');
        
        // Send the converted file back to the client
        res.download(outputFilePath, (err) => {
            if (!err) {
                console.log('Download successful, deleting files.');
                // Clean up temporary files
                fs.unlinkSync(inputFilePath);
                fs.unlinkSync(outputFilePath);
            } else {
                console.log('Error during download:', err);
            }
        });

    } catch (error) {
        console.error('Conversion error:', error.message);
        return res.status(500).send('Conversion failed');
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Image Conversion API is running.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});