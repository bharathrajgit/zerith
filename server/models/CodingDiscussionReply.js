const mongoose = require('mongoose');

const codingDiscussionReplySchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingDiscussionThread',
      required: true,
    },
    authorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CodingDiscussionReply', codingDiscussionReplySchema);
