import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index';
import { DocumentModel, Folder } from '../models/Document';
import { signAccessToken } from '../utils/jwt';
import { UserRole } from '@nextx/shared';
import path from 'path';
import fs from 'fs';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Disconnect from the real database if connected
  await mongoose.disconnect();
  
  // Start mongo in-memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 300000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await DocumentModel.deleteMany({});
  await Folder.deleteMany({});
});

describe('Document and Folder APIs', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const token = signAccessToken({
    userId,
    email: 'test@example.com',
    role: UserRole.USER,
  });

  describe('Folder CRUD', () => {
    it('should create a new folder', async () => {
      const res = await request(app)
        .post('/api/folders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Medical Reports',
          color: '#ff0000',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Medical Reports');
      expect(res.body.data.color).toBe('#ff0000');
    });

    it('should list user folders', async () => {
      await Folder.create({
        userId: new mongoose.Types.ObjectId(userId),
        name: 'School Letters',
        color: '#00ff00',
      });

      const res = await request(app)
        .get('/api/folders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('School Letters');
    });
  });

  describe('Document CRUD', () => {
    it('should upload a document using local fallback', async () => {
      const res = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('hello world'), 'test-doc.txt')
        .field('name', 'My Test Doc')
        .field('description', 'Test desc')
        .field('tags', 'tag1, tag2');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('My Test Doc');
      expect(res.body.data.originalName).toBe('test-doc.txt');
      expect(res.body.data.tags).toContain('tag1');
      expect(res.body.data.tags).toContain('tag2');
      
      // Check if file exists locally
      const localFilename = res.body.data.firebasePath.replace('uploads/', '');
      const filePath = path.join(__dirname, '../../uploads', localFilename);
      expect(fs.existsSync(filePath)).toBe(true);

      // Cleanup local file
      fs.unlinkSync(filePath);
    });

    it('should list documents with filters', async () => {
      const folderId = new mongoose.Types.ObjectId();
      await DocumentModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        folderId,
        source: 'upload',
        name: 'Report.pdf',
        originalName: 'Report.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        firebasePath: 'uploads/temp-file.pdf',
        downloadUrl: 'http://localhost/temp-file.pdf',
        tags: ['medical'],
      });

      const res = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`)
        .query({ folderId: folderId.toString() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Report.pdf');
    });
  });
});
