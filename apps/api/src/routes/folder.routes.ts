import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createFolderSchema, updateFolderSchema } from '@nextx/shared';
import * as folderController from '../controllers/folder.controller';

const router = Router();
router.use(authenticate);

router.get('/', folderController.listFolders);
router.post('/', validate(createFolderSchema), folderController.createFolder);
router.patch('/:id', validate(updateFolderSchema), folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);

export { router as folderRoutes };
