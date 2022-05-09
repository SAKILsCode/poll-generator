const { lazyrouter } = require('express/lib/application');
const PollSchema = require('./PollSchema');

exports.createPollGetController = (req, res, next) => {
  res.render('create');
};

exports.createPollPostController = async (req, res, next) => {
  let { title, description, options } = req.body;

  options = options.map((opt) => {
    return {
      name: opt,
    };
  });

  let poll = new PollSchema({
    title,
    description,
    options,
  });

  try {
    await poll.save();
    res.redirect('/polls');
  } catch (e) {
    console.log(e);
  }
};

exports.getAllPolls = async (req, res, next) => {
  try {
    let polls = await PollSchema.find();
    res.render('polls', { polls });
  } catch (e) {
    console.log(e);
  }
};

exports.viewPollGetController = async (req, res, next) => {
  let selectedPollId = req.params.id;

  try {
    let poll = await PollSchema.findById(selectedPollId);

    let options = [...poll.options];
    let result = [];

    options.forEach((opt) => {
      let percentage = (opt.vote * 100) / poll.totalVote;
      result.push({
        ...opt._doc,
        percentage: percentage ? percentage : 0,
      });
    });

    res.render('viewPoll', { poll, result });
  } catch (e) {
    console.log(e);
  }
};

exports.viewPollPostController = async (req, res, next) => {
  let selectedPollId = req.params.id;
  let selectedOptionId = req.body.option;

  try {
    let poll = await PollSchema.findById(selectedPollId);

    let options = [...poll.options];

    options.forEach((opt) => {
      if (opt.id === selectedOptionId.trim()) opt.vote++;
    });

    let totalVote = poll.totalVote + 1;

    await PollSchema.findOneAndUpdate(
      { _id: poll._id },
      { $set: { options, totalVote } }
    );

    res.redirect('/polls/' + selectedPollId);
  } catch (e) {
    console.log(e);
  }
};
