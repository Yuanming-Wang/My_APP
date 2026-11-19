import { Router } from 'express'
import db from '../db.js'
import { validateDraft, validateStory } from '../middleware/validate.js'
import { completeDraft, createDraft, deleteDraft, getDraft, updateDraftPhoto } from '../services/drafts.js'
import { deleteAssetFiles } from '../services/assets.js'

const router = Router()

router.post('/', validateDraft, (req, res) => {
  const draft = createDraft(db, req.ownerId, req.body)
  res.status(201).json({ success: true, data: draft })
})

router.get('/:id', (req, res) => {
  const draft = getDraft(db, req.params.id)
  if (!draft) return res.status(404).json({ success: false, error: '草稿不存在或已过期' })
  res.json({ success: true, data: draft })
})

router.put('/:id/photos/:photoId', validateStory, (req, res) => {
  const photo = updateDraftPhoto(db, req.params.id, req.params.photoId, req.body.story)
  res.json({ success: true, data: photo })
})

router.post('/:id/complete', (req, res) => {
  const book = completeDraft(db, req.params.id)
  res.json({ success: true, data: book })
})

router.delete('/:id', (req, res) => {
  const assets = deleteDraft(db, req.params.id)
  deleteAssetFiles(assets)
  res.json({ success: true, message: '草稿已删除' })
})

export default router
