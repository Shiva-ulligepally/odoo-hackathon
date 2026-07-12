const fs = require('fs');
const path = require('path');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const UploadedDocumentRepository = require('../repositories/UploadedDocumentRepository');

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

    return document;
  }
}

module.exports = new UploadService();
