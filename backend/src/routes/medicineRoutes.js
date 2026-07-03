const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const medicineController = require('../controllers/medicineController');

router.get('/', requireAuth, medicineController.getMedicines);
router.post('/', requireAuth, medicineController.addMedicine);
router.put('/:id', requireAuth, medicineController.updateMedicine);
router.delete('/:id', requireAuth, medicineController.deleteMedicine);

router.post('/:id/take', requireAuth, medicineController.markTaken);

module.exports = router;
