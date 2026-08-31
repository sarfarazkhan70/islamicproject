import { QiblaService } from '../services/qibla.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
export class QiblaController {
    static calculate(req, res, next) {
        try {
            const lat = parseFloat(req.query.lat);
            const lng = parseFloat(req.query.lng);
            if (isNaN(lat) || isNaN(lng)) {
                res.status(400).json(sendError('INVALID_COORDINATES', 'Valid lat and lng query parameters are required.'));
                return;
            }
            const qibla = QiblaService.calculate(lat, lng);
            res.status(200).json(sendSuccess(qibla));
        }
        catch (err) {
            res.status(400).json(sendError('CALCULATION_ERROR', err.message));
        }
    }
}
