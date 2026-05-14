const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getCodingHub,
  getCodingProblemById,
  getCodingProblemByTopic,
  getCodingSubmissions,
  runCodingProblem,
  submitCodingProblem,
  updateWorkspaceDraft,
  listCodingDiscussions,
  createCodingDiscussion,
  getCodingDiscussionThread,
  addCodingDiscussionReply,
  resolveCodingDiscussionThread,
  deleteCodingDiscussionThread,
  deleteCodingDiscussionReply,
} = require('../controllers/coding.controller');

router.use(protect);

router.get('/', getCodingHub);
router.get('/by-topic/:topicId', getCodingProblemByTopic);
router.get('/:problemId/discussions', listCodingDiscussions);
router.post('/:problemId/discussions', createCodingDiscussion);
router.get('/discussions/:threadId', getCodingDiscussionThread);
router.post('/discussions/:threadId/replies', addCodingDiscussionReply);
router.patch('/discussions/:threadId/resolve', resolveCodingDiscussionThread);
router.delete('/discussions/:threadId', deleteCodingDiscussionThread);
router.delete('/discussions/:threadId/replies/:replyId', deleteCodingDiscussionReply);
router.get('/:problemId/submissions', getCodingSubmissions);
router.put('/:problemId/workspace', updateWorkspaceDraft);
router.post('/:problemId/run', runCodingProblem);
router.post('/:problemId/submit', submitCodingProblem);
router.get('/:problemId', getCodingProblemById);

module.exports = router;
