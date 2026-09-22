const request = require('supertest');
const app = require('../server');
const { analyzeHeuristics } = require('../src/services/heuristicScanner');

jest.setTimeout(15000);

describe('PhishGuard AI API Tests', () => {

    describe('GET /api/health', () => {
        it('should return system health status 200 OK', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'ok');
            expect(res.body).toHaveProperty('service', 'PhishGuard AI');
        });
    });

    describe('POST /api/scan-offer', () => {
        it('should return 400 Bad Request when no text or document is provided', async () => {
            const res = await request(app)
                .post('/api/scan-offer')
                .send({});
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 Bad Request when text exceeds 15,000 characters', async () => {
            const longText = 'A'.repeat(15001);
            const res = await request(app)
                .post('/api/scan-offer')
                .send({ text: longText });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/exceeds maximum limit/i);
        });

        it('should process text input and return structured threat verdict', async () => {
            const sampleText = "Subject: Urgent account verification required immediately within 24 hours.";
            const res = await request(app)
                .post('/api/scan-offer')
                .send({ text: sampleText });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('threatScore');
            expect(res.body).toHaveProperty('flags');
            expect(res.body).toHaveProperty('summary');
            expect(typeof res.body.threatScore).toBe('number');
            expect(Array.isArray(res.body.flags)).toBe(true);
        }, 15000);
    });

    describe('Heuristic Scanner Unit Tests', () => {
        it('should detect suspicious gmail email and telegram contact pattern', () => {
            const suspiciousText = "Contact recruiter at hr-company@gmail.com on Telegram app for immediate interview.";
            const result = analyzeHeuristics(suspiciousText);

            expect(result.heuristicScore).toBeGreaterThanOrEqual(40);
            expect(result.flags.length).toBeGreaterThanOrEqual(2);
        });

        it('should return 0 threat score for normal legitimate email text', () => {
            const safeText = "Dear Candidate, thank you for attending the interview at our office today.";
            const result = analyzeHeuristics(safeText);

            expect(result.heuristicScore).toBe(0);
            expect(result.flags.length).toBe(0);
        });
    });
});
