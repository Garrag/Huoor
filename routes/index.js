var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index');
});

router.get('/admin', function (req, res, next) {
	res.render('admin');
});

//拉取github代码
router.all('/update', function (req, res, next) {
	// console.log('start --------------updateGit------------------')
	var cmd = 'cd /Huoor && git pull';   //'cd ~ && ls' 
	exec(cmd, function (err, stdout, stderr) {
		if (err) {
			res.jsonp({ code: 1, msg: stderr })
			console.log(stderr);
			return;
		} else {
			res.jsonp({ code: 0, msg: stdout })
			console.log(stdout)
			// console.log('end --------------updateGit------------------')
		}
	})
});

module.exports = router;
