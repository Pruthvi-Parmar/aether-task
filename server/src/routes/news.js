import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import News from '../models/News.js';
import Photo from '../models/Photo.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// get news
router.get('/', async (req, res) => {
  try {
    const items = await News.find().populate('photoId').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get news by id
router.get('/:id', async (req, res) => {
  try {
    const item = await News.findById(req.params.id).populate('photoId');
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

// Create news
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    let photoDoc = null;
    if (req.file) {
      photoDoc = await Photo.create({
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    }

    const { title, description, insertBy } = req.body;
    const news = await News.create({
      title,
      description,
      insertBy,
      photoId: photoDoc ? photoDoc._id : undefined,
    });

    const populated = await news.populate('photoId');

    const io = req.app.get('io');
    io.emit('news:created', { by: insertBy, news: populated });

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create news' });
  }
});

// Update news
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { title, description, updateBy } = req.body;
    const update = { title, description, updateBy };

    if (req.file) {
      const photoDoc = await Photo.create({
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
      update.photoId = photoDoc._id;
    }

    const updated = await News.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate('photoId');

    if (!updated) return res.status(404).json({ error: 'Not found' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update news' });
  }
});

export default router;
