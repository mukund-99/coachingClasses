var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var exe = require("../connection");

router.get('/', async (req, res) => {
  try {
    const coursesSql  = "SELECT * FROM courses WHERE status = 1";
    const counterSql  = "SELECT * FROM counters WHERE status = 1";
    const facultySql  = "SELECT * FROM faculty WHERE status = 1";
    const batchesSql  = "SELECT * FROM batches WHERE status = 1";
    const toppersSql  = "SELECT * FROM toppers WHERE status = 1 ORDER BY achievement DESC";

    const courses  = await exe(coursesSql);
    const counters = await exe(counterSql);
    const faculty  = await exe(facultySql);
    const batches  = await exe(batchesSql);
    const toppers  = await exe(toppersSql);

    res.render('user/home.ejs', {
      courses,
      counters,
      faculty,
      batches,
      toppers
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});



router.get('/about-us', async (req, res) => {
  try {
    const [counters, history, director ] = await Promise.all([
      exe("SELECT * FROM counters WHERE status = 1"),
      exe("SELECT * FROM about_history WHERE status = 1 ORDER BY history_id ASC"),
      exe("SELECT * FROM director_message WHERE status = 1 LIMIT 1")
    ]);

    res.render('user/aboutus.ejs', { counters, history, director});
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


router.get('/courses', (req,res) => {
    var sql = "SELECT * FROM courses WHERE status = '1'";
    exe(sql).then((courses) => {
        res.render('user/courses.ejs', { courses: courses });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/faculty', (req,res) => {
    var facultySql = "SELECT * FROM faculty WHERE status = '1'";
    exe(facultySql).then((faculty) => {
        res.render('user/faculty.ejs', { faculty: faculty });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/batches', (req,res) => {
    var batches = "SELECT * FROM batches WHERE status = '1'";
    var courses = "SELECT * FROM courses WHERE status = '1'";
    exe(batches).then((batches) => {
        exe(courses).then((courses) => {
            res.render('user/batches.ejs', { batches: batches, courses: courses });
        }).catch((err) => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});
   

router.get('/achievements', async (req, res) => {
  try {
    const countersSql     = "SELECT * FROM counters WHERE status = 1";
    const toppersSql      = "SELECT * FROM toppers WHERE status = 1 ORDER BY achievement DESC";
    const achievementsSql = "SELECT * FROM exam_achievements WHERE status = 1 ORDER BY achievement_id DESC";
    const factorsSql      = "SELECT * FROM success_factors WHERE status = 1";

    const [counters, toppers, achievements, factors] = await Promise.all([
      exe(countersSql),
      exe(toppersSql),
      exe(achievementsSql),
      exe(factorsSql)
    ]);

    res.render('user/achievements.ejs', {
      counters,
      toppers,
      achievements,
      factors
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/contact', (req,res) => {
    res.render('user/contact.ejs');
});

// User Form Submissions
router.post('/enroll-course', async (req, res) =>{
    var data = req.body;
    var sql = "INSERT INTO enroll_data (std_name, course, mobile, email, message) VALUES (?, ?, ?, ?, ?)";
    await exe(sql, [data.fullname, data.course, data.mobile, data.email, data.message]);
    res.redirect(req.get('referer'));
});

router.post('/enquiry-submit', async (req, res) =>{
    var data = req.body;
    var sql = "INSERT INTO enquiry_data (std_name, course, mobile, email,message) VALUES (?, ?, ?, ?, ?)";
    await exe(sql, [data.name, data.course, data.phone, data.email, data.message]);
    res.redirect(req.get('referer'));
});

router.post('/counseling', async (req, res) => {
    var data = req.body;
    var sql = "INSERT INTO counseling_data (std_name, mobile, email, message, date_time) VALUES (?, ?, ?, ?, ?)";
    await exe(sql, [data.name, data.mobile, data.email, data.message, new Date()]);
    res.redirect(req.get('referer'));
});




module.exports = router;