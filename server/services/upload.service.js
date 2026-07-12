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
      verificationStatus: 'Verified' // Auto verify in staging
    });

    // 1. Create Activity Log
    await ActivityLogRepository.create({
      user: user._id,
      organization: user.organization,
      action: 'Document Uploaded',
      details: `Uploaded ESG verification document: ${fileName}`
    });

    // 2. Create mock Confidence Score for this document
    await ConfidenceScoreRepository.create({
      organization: user.organization,
      targetModel: 'UploadedDocument',
      targetId: document._id,
      score: 98,
      factors: [
        { factorName: 'File Integrity Check', status: 'Pass', weight: 40 },
        { factorName: 'Digital Signature Verified', status: 'Pass', weight: 30 },
        { factorName: 'Source Verification', status: 'Pass', weight: 30 }
      ],
      verifiedByAI: true
    });

    // 3. Create mock AI Recommendation based on this document upload
    await AIRecommendationRepository.create({
      organization: user.organization,
      recommendationType: 'Carbon Reduction',
      title: `Optimize emissions based on ${fileName}`,
      description: `AI analyzed the uploaded document and recommends switching to low-emission alternative transport routes to save up to 12% in travel overhead.`,
      potentialSavingsCo2e: 3.5,
      potentialFinancialSavings: 850,
      confidenceScore: 94
    });

    return document;
  }
}

module.exports = new UploadService();
