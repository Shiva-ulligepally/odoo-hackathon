const fs = require('fs');
const path = require('path');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const UploadedDocumentRepository = require('../repositories/UploadedDocumentRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const ConfidenceScoreRepository = require('../repositories/ConfidenceScoreRepository');
const AIRecommendationRepository = require('../repositories/AIRecommendationRepository');

class UploadService {
  async uploadFile(file, user) {
    let fileUrl = '';
    let fileName = file.originalname;
    let fileType = file.mimetype;

    if (isConfigured) {
      // Upload to Cloudinary using a stream since files are in memory buffer
      fileUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ecosphere_ai_documents', resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    } else {
      // Fallback: Store locally in the server's uploads folder
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      fs.writeFileSync(filePath, file.buffer);
      fileUrl = `/uploads/${uniqueFileName}`;
      console.log(`Saved file locally: ${filePath}`);
    }

    // Save upload metadata in database
    const document = await UploadedDocumentRepository.create({
      name: fileName,
      url: fileUrl,
      fileType,
      owner: user._id,
      organization: user.organization,
      verificationStatus: 'Pending' // Start with Pending, Python pipeline updates to Verified/Rejected
    });

    // 1. Create Activity Log
    await ActivityLogRepository.create({
      user: user._id,
      organization: user.organization,
      action: 'Document Uploaded',
      details: `Uploaded ESG verification document: ${fileName}`
    });

    // 2. Trigger Python AI service asynchronously in background
    const triggerAIPipeline = async () => {
      try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        console.log(`Triggering AI pipeline for document ${document._id}...`);
        const response = await fetch(`${aiServiceUrl}/api/ai/process-document`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentId: document._id.toString(),
            organizationId: user.organization.toString(),
            userId: user._id.toString(),
            fileUrl: fileUrl.startsWith('/') ? `http://localhost:${process.env.PORT || 5000}${fileUrl}` : fileUrl,
            fileType,
            fileName
          })
        });
        const result = await response.json();
        console.log(`AI pipeline trigger response for ${fileName}:`, result);
      } catch (err) {
        console.error(`Error triggering AI pipeline for ${fileName}:`, err.message);
      }
    };

    setImmediate(triggerAIPipeline);

    return document;
  }
}

module.exports = new UploadService();
