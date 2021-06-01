const router = require('express').Router();
let Test = require('./test.model');

/*
 *TODO ФУНКЦИЯ ПРОВЕРКИ ВАЛИДНОСТИ ПАРАМЕТРОВ
 * https://github.com/VKCOM/vk-apps-launch-params
 */

// router.route('/test_init').post((req, res) => {
//     Test.findByIdAndUpdate()
// })

router.route('/decr_attempt').patch((req, res) => {
    if (req.body.firstRun) {
        Test.findByIdAndUpdate(req.body.testID, [{
            $set: {
                results: {
                    $concatArrays: ["$results", [{
                        _id: req.body.userID,
                        score: 0,
                        attemptsLeft: {$subtract: ["$numberOfAttempts", 1]}
                    }]]
                }
            }
        }])
            .then(() => {
                res.json("Attempts decremented!");
                console.log(`Attempts decremented ${req.body.testID}/${req.body.userID}`)
            })
            .catch(err => {
                res.status(400).json('Error: ' + err)
                console.log('Error', err)
            })
    } else {
        Test.findOneAndUpdate({
            _id: req.body.testID,
            "results._id": req.body.userID
        }, {$inc: {"results.$.attemptsLeft": -1}})
            .then(() => {
                res.json("Attempts decremented!");
                console.log(`Attempts decremented ${req.body.testID}/${req.body.userID}`)
            })
            .catch(err => {
                res.status(400).json('Error: ' + err)
                console.log('Error', err)
            })
    }
})

router.route('/set_score').patch((req, res) => {
    Test.findOneAndUpdate({_id: req.body.testID, "results._id": req.body.userID}, {"results.$.score": req.body.score})
        .then(() => {
            res.json("Score was set!!");
            console.log(`Score ${req.body.testID}/${req.body.userID}/${req.body.score}`)
        })
        .catch(err => {
            res.status(400).json('Error: ' + err)
            console.log('Error', err)
        })
})

router.route('/tests_list_admin').post((req, res) => {
    {
        //security test
        Test.aggregate([
            {
                $match: {
                    ownerID: req.body.ownerID,
                    isGroup: req.body.isGroup,
                }
            }
            , {
                $project: {
                    title: 1,
                    description: 1,
                    image: 1,
                    isActive: 1,
                    showAnswers: 1,
                    numberOfAttempts: 1,
                    numberOfQuestions: {
                        $size: "$questions"
                    },
                    numberOfResults: {
                        $size: "$results"
                    },
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ])
            .then(tests => {
                res.json(tests)
                console.log(`ADMIN: Tests list id${req.body.ownerID}-${req.params.isGroup ? "group" : "user"}`)
            })
            .catch(err => {
                res.status(400).json('Error: ' + err)
                console.log('Error: ' + err)
            });
    }
})

router.route('/tests_list/:ownerID/:isGroup/:userID').get((req, res) => {
    Test.aggregate([
        {
            $match: {
                ownerID: parseInt(req.params.ownerID),
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
                result: {
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
        .then(tests => {
            res.json(tests)
            console.log(`Tests list id${req.params.ownerID}-${req.params.isGroup ? "group" : "user"} sent to id${req.params.userID}`)
        })
        .catch(err => {
            res.status(400).json('Error: ' + err)
            console.log('Error: ' + err)
        });
});

router.route('/delete_test').delete((req, res) => {
    //security test
    Test.findByIdAndDelete(req.body.testID)
        .then(() => {
            res.json("Test deleted!")
            console.log(`Test ${req.body.testID} deleted`)
        })
        .catch(err => {
            res.status(400).json('Error: ' + err)
            console.log('Error: ' + err)
        });
})

router.route('/test/:testID/:userID').get((req, res) => {
    console.log(req.params)
    Test.findById(req.params.testID, {
        title: 1,
        image: 1,
        questions: 1,
        finals: 1,
        result: {
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
    })
        .then(test => res.json(test))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const newTest = new Test(req.body)

    newTest.save()
        .then((dbres) => console.log('New test in database: ' + dbres._id))
        .then(() => res.json("Test added!"))
        .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;