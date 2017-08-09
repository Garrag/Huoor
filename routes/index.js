var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/admin', function(req, res, next) {
  res.render('admin');
});

//拉取github代码
router.all('/updateGit', function(req, res, next) {
	console.log('start --------------updateGit------------------')
	var cmd ='cd /home/git/ChessGame/ && git pull origin master';   //'cd ~ && ls' 
	exec(cmd, function(err, stdout, stderr){
		if(err){
			res.jsonp({code:1, msg:stderr})
			console.log(stderr);
			return;
		}else {
			res.jsonp({code:0, msg:stdout})
			console.log(stdout)
			console.log('end --------------updateGit------------------')
		}
	})
});

module.exports = router;
