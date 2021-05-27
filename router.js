const router = require('express').Router();
let Test = require('./test.model');

/*
 *TODO ФУНКЦИЯ ПРОВЕРКИ ВАЛИДНОСТИ ПАРАМЕТРОВ
 * https://github.com/VKCOM/vk-apps-launch-params
 */

router.route('/sub_attempt').patch((req, res) => {
    if(req.body.firstRun==='true') {
        Test.findByIdAndUpdate(req.body.testID, ({ $push: { results: {_id: req.body.userID, attemptsLeft: "$numberOfAttempts"-1} } }))
    .then((dbres) => console.log('subtracted ', dbres))
            .then(() => res.json("Subtracted"))
            .catch(err => res.status(400).json('Error: ' + err));
    }
})

//http://localhost:5000/43340456/1/122320254
router.route('/:owner/:isGroup/:userID').get((req, res) => {
    Test.aggregate([
        {
        $match: {
            owner: parseInt(req.params.owner),
            isGroup: (req.params.isGroup === 'true'),
            isActive: true
        }
    }
    , {
        $project: {
            title: 1,
            description: 1,
            image: 1,
            numberOfAttempts: 1,
            numberOfQuestions: {
                $size: "$questions"
            },
            results: {
                $first: {
                    $filter: {
                        input: "$results",
                        as: "result",
                        cond: {
                            $eq: ["$$result._id", parseInt(req.params.userID)]
                        }
                    }
                }
            }
        }
    }
    ])
        .then(tests => res.json(tests))
        .catch(err => res.status(400).json('Error: ' + err));
});

//http://localhost:5000/test/60ab9b07e1a65837998bffaa
router.route('/test/:testID').get((req, res) => {
    Test.findById(req.params.testID)
        .then(test => res.json(test))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    // Test.collection.drop()
    const newTest = new Test(req.body)

    newTest.save()
        .then((dbres) => console.log('New test in database: '+dbres._id))
        .then(() => res.json("Test added!"))
        .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;