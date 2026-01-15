var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
var exe = require("../connection");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });


router.get('/', (req,res) => {
    res.render('admin/home.ejs');
});

router.get('/admin_login', (req,res) => {
    res.render('admin/login.ejs');
});

router.post('/register-admin-process', async (req,res) => {
    var data = req.body;
    var sql = "INSERT INTO admin_register (admin_name, admin_email, admin_password) VALUES (?, ?, ?)";
    await exe(sql, [data.fullname, data.email, data.password]);

    res.redirect('/admin/admin_login');
});

router.post('/login-admin', (req,res) => {
    var d = req.body;
    var sql = 'SELECT * FROM admin_register WHERE admin_email = ? AND admin_password = ?';
    exe(sql, [d.email, d.password]).then((result) => {
        if(result.length > 0){
            res.redirect('/admin/admin_pannel');
        } else {
            res.send("Invalid Email or Password. Please try again.");
        }
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/admin_pannel', async (req, res) => {
    try {
    var enrollSql = "SELECT e.* , COUNT(*) OVER() AS total_enrollments FROM enroll_data e";
        var enquirySql = 'SELECT en.*, COUNT(*) OVER() AS total_enquiries FROM enquiry_data en';
        var counselingSql = 'SELECT c.*, COUNT(*) OVER() AS total_counselings FROM counseling_data c';
        var faculty = ' SELECT f.*, COUNT(*) OVER() AS total_faculty FROM faculty f';
        var enrollments = await exe(enrollSql);
        var enquiries = await exe(enquirySql);
        var counselings = await exe(counselingSql);
        var faculty = await exe(faculty);
        res.render('admin/admin_pannel.ejs', { enrollments: enrollments, enquiries: enquiries, counselings: counselings, faculty:faculty });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


router.get('/students', async (req, res) => {
     try {
    var enrollSql = "SELECT e.* , COUNT(*) OVER() AS total_enrollments FROM enroll_data e";
        var enquirySql = 'SELECT en.*, COUNT(*) OVER() AS total_enquiries FROM enquiry_data en';
        var counselingSql = 'SELECT c.*, COUNT(*) OVER() AS total_counselings FROM counseling_data c';
        var enrollments = await exe(enrollSql);
        var enquiries = await exe(enquirySql);
        var counselings = await exe(counselingSql);
  
        res.render('admin/students.ejs', { enrollments: enrollments, enquiries: enquiries, counselings: counselings });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/enroll_std_edit/:id', (req, res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM enroll_data WHERE enroll_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/enroll-std-edit.ejs', { enrollment: result[0] });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/enroll-std-delete/:id', (req, res) => {
    var id = req.params.id;
    var sql = "DELETE FROM enroll_data WHERE enroll_id = ?";
    exe(sql, [id]).then(() => {
        res.redirect(req.get('referer'));
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.post('/enroll_std_update/:id', async (req, res) => {
    var id = req.params.id;
    var data = req.body;
    var sql = "UPDATE enroll_data SET std_name = ?, course = ?, mobile = ?, email = ?, message = ? WHERE enroll_id = ?";
    await exe(sql, [data.std_name, data.course, data.phone, data.email, data.message || '', id]);
    res.redirect('/admin/students');
});

router.get('/counseling_std_edit/:id', (req, res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM counseling_data WHERE counseling_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/counseling-std-edit.ejs', { counseling: result[0] });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/counseling_std_delete/:id', (req, res) => {
    var id = req.params.id;
    var sql = "DELETE FROM counseling_data WHERE counseling_id = ?";
    exe(sql, [id]).then(() => {
        res.redirect(req.get('referer'));
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.post('/counseling_std_update/:id', async (req, res) => {
    var id = req.params.id;
    var data = req.body;
    var sql = "UPDATE counseling_data SET std_name = ?, mobile = ?, email = ? WHERE counseling_id = ?";
    await exe(sql, [data.std_name, data.phone, data.email, id]);
    res.redirect('/admin/students');
});

router.get('/enquiries_std_edit/:id', (req, res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM enquiry_data WHERE enquiry_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/enquiries-std-edit.ejs', { enquiry: result[0] });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/enquiries_std_delete/:id', (req, res) => {
    var id = req.params.id;
    var sql = "DELETE FROM enquiry_data WHERE enquiry_id = ?";
    exe(sql, [id]).then(() => {
        res.redirect(req.get('referer'));
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.post('/enquiries_std_update/:id', async (req, res) => {
    var id = req.params.id;
    var data = req.body;
    var sql = "UPDATE enquiry_data SET std_name = ?, course = ?, mobile = ?, email = ?, message = ? WHERE enquiry_id = ?";
    await exe(sql, [data.std_name, data.course, data.phone, data.email, data.message || '', id]);
    res.redirect('/admin/students');
});

router.get('/courses', (req,res) => {
    res.render('admin/courses.ejs' ,{ course: null });
});


router.post('/course_save', async (req, res) => {
  try {
    const data = req.body;
    await exe(
      `INSERT INTO courses 
       (course_code, course_title, category, description, price, price_label, duration, mode, features)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.course_code,
        data.course_title,
        data.category,
        data.description,
        data.price || 0,
        data.price_label || '',
        data.duration || '',
        data.mode || '',
        data.features || ''
      ]
    );
    res.redirect('/admin/courses');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving course");
  }
});


router.get('/courses_list', async (req,res) => {
    var sql = "SELECT * FROM courses";
    var courses = await exe(sql);
    res.render('admin/courses-list.ejs', { courses: courses });
});

router.get('/courses_edit/:id', (req,res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM courses WHERE course_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/courses.ejs', { course: result[0], isEdit: true });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.post('/course_update/:id', async (req,res) => {
    var id = req.params.id;
    var data = req.body;
    var sql = "UPDATE courses SET course_code = ?, course_title = ?, category = ?, description = ?, price = ?, price_label = ?, duration = ?, mode = ?, features = ?, status = ? WHERE course_id = ?";
    await exe(sql, [data.course_code, data.course_title, data.category, data.description, data.price || 0, data.price_label || '', data.duration || '', data.mode || '', data.features || '', data.status || 'active', id]);
    res.redirect('/admin/courses_list');
});

router.get('/courses_delete/:id', (req,res) => {
    var id = req.params.id;
    var sql = "DELETE FROM courses WHERE course_id = ?";
    exe(sql, [id]).then(() => {
        res.redirect('/admin/courses_list');
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/performance', (req,res) => {
    res.render('admin/performance.ejs', {counter: null});
});

router.post('/counter-add', async (req,res) => {
    var data = req.body;
    var sql = "INSERT INTO counters (title, value, suffix, description, color) VALUES (?, ?, ?, ?, ?)";
    await exe(sql, [data.title, data.value || 0, data.suffix || '', data.description || '', data.color || 'primary']);
    res.redirect('/admin/performance');
});

router.get('/performance-records', async (req,res) => {
    var sql = "SELECT * FROM counters";
    var counters = await exe(sql);
    res.render('admin/performance-records.ejs', { counters: counters });
});

router.get('/counter-delete/:id', (req,res) => {
    var id = req.params.id;
    var sql = "DELETE FROM counters WHERE counter_id = ?";
    exe(sql, [id]).then(() => {
        res.redirect('/admin/performance-records');
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/counter-edit/:id', (req,res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM counters WHERE counter_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/performance.ejs', { counter: result[0], isEdit: true });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});


router.post('/counter-update/:id', async (req,res) => {
    var id = req.params.id;
    var data = req.body;
    var sql = "UPDATE counters SET title = ?, value = ?, suffix = ?, description = ?, color = ?, status = ? WHERE counter_id = ?";
    await exe(sql, [data.title, data.value || 0, data.suffix || '', data.description || '', data.color || 'primary', data.status || 'active', id]);
    res.redirect('/admin/performance-records');
});


router.get('/faculty', (req,res) => {
    res.render('admin/faculty.ejs',{faculty: null});
});

// router.post('/faculty_add', upload  .single('image'), async (req,res) => {
//     var data = req.body;
//     var image = req.file ? req.file.filename : '';
//     var sql = "INSERT INTO faculty (faculty_name, subject, experience, image) VALUES (?, ?, ?, ?)";
//     await exe(sql, [data.faculty_name, data.subject, data.experience || '', image]);
//     res.redirect(req.get('referer'));
// });
router.post('/faculty_add', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    const image = req.file ? req.file.filename : '';

    const sql = `
      INSERT INTO faculty (faculty_name, subject, experience, image)
      VALUES (?, ?, ?, ?)
    `;

    await exe(sql, [
      data.faculty_name,
      data.subject,
      data.experience || '',
      image
    ]);

    res.redirect(req.get('referer'));
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});


router.get('/faculty-records', (req,res) => {
    var sql = "SELECT * FROM faculty";
    exe(sql).then((faculty) => {
        res.render('admin/faculty-records.ejs', { faculty: faculty });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

// router.get('/faculty_delete/:id', (req,res) => {
//     var id = req.params.id;
//     var sql = "DELETE FROM faculty WHERE faculty_id = ?";
//     exe(sql, [id]).then(() => {
//         res.redirect('/admin/faculty-records');
//     }).catch((err) => {
//         console.error(err);
//         res.status(500).send("Internal Server Error");
//     });
// });

router.get('/faculty_delete/:id', (req, res) => {
    var id = req.params.id;
    // First, fetch the image filename
    var selectSql = "SELECT image FROM faculty WHERE faculty_id = ?";
    exe(selectSql, [id]).then((result) => {
        if (result.length > 0 && result[0].image) {
            // Delete the image file from uploads folder
            fs.unlink('uploads/' + result[0].image, (err) => {
                if (err) console.error('Error deleting image:', err);
            });
        }
        // Then delete the record from database
        var deleteSql = "DELETE FROM faculty WHERE faculty_id = ?";
        return exe(deleteSql, [id]);
    }).then(() => {
        res.redirect('/admin/faculty-records');
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});



router.get('/faculty_edit/:id', (req,res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM faculty WHERE faculty_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/faculty.ejs', { faculty: result[0], isEdit: true });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.post('/faculty_update/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const { faculty_name, subject, experience, status } = req.body;

    let sql, params;

    if (req.file) {
      // WITH image
      sql = `
        UPDATE faculty 
        SET faculty_name = ?, subject = ?, experience = ?, status = ?, image = ?
        WHERE faculty_id = ?
      `;
      params = [
        faculty_name,
        subject,
        experience || '',
        status,
        req.file.filename,
        id
      ];
    } else {
      // WITHOUT image
      sql = `
        UPDATE faculty 
        SET faculty_name = ?, subject = ?, experience = ?, status = ?
        WHERE faculty_id = ?
      `;
      params = [
        faculty_name,
        subject,
        experience || '',
        status,
        id
      ];
    }

    await exe(sql, params);

    res.redirect('/admin/faculty-records');
  } catch (err) {
    console.error(err);
    res.status(500).send('Faculty update failed');
  }
});


router.get('/batches', (req,res) => {   
    res.render('admin/batches.ejs', { batch: null });
});

router.post('/batch_add', async (req,res) => {
    var data = req.body;
    var sql = "INSERT INTO batches (batch_name, course_name, start_date, class_timing, mode) VALUES (?, ?, ?, ?, ?)";
    await exe(sql, [data.batch_name, data.course_name, data.start_date || '', data.class_timing || '', data.mode || '']);
    res.redirect('/admin/batches');
});

router.get('/batches_list', async (req,res) => {
    var sql = "SELECT * FROM batches";
    var batches = await exe(sql);
    res.render('admin/batches-list.ejs', { batches: batches });
});


router.get('/batch_edit/:id', (req,res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM batches WHERE batch_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/batches.ejs', { batch: result[0], isEdit: true });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.post('/batch_update/:id', async (req,res) => {
    var id = req.params.id;
    var data = req.body;
    var sql = "UPDATE batches SET batch_name = ?, course_name = ?, start_date = ?, class_timing = ?, mode = ?, status = ? WHERE batch_id = ?";
    await exe(sql, [data.batch_name, data.course_name, data.start_date || '', data.class_timing || '', data.mode || '', data.status || 'active', id]);
    res.redirect('/admin/batches_list');
});

router.get('/batch_delete/:id', (req,res) => {
    var id = req.params.id;
    var sql = "DELETE FROM batches WHERE batch_id = ?";
    exe(sql, [id]).then(() => {
        res.redirect('/admin/batches_list');
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});


router.get('/top_achievements_add',(req,res) =>{
    res.render('admin/top-achievements-add.ejs', {topper:null});
});

router.post('/toppers_add', upload.single('photo'), async (req,res) => {
    var data = req.body;
    var image = req.file ? req.file.filename : '';
    var sql = "INSERT INTO toppers (student_name, exam_name, exam_year, achievement, photo) VALUES (?, ?, ?, ?, ?)";
    await exe(sql, [data.student_name, data.exam_name, data.exam_year || '', data.achievement || '', image]);
    res.redirect('/admin/top_achievements_list');
});

router.get('/top_achievements_list', async (req,res) => {
    var sql = "SELECT * FROM toppers";
    var toppers = await exe(sql);
    res.render('admin/top_achievements_list.ejs', {toppers: toppers});
});

router.get('/toppers_edit/:id', (req,res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM toppers WHERE topper_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/top-achievements-add.ejs', { topper: result[0] });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.post('/toppers_update/:id', upload.single('photo'), async (req,res) => {
    var id = req.params.id;
    var data = req.body;
    let sql, params;

    if (req.file) {
        // Update with new photo
        sql = "UPDATE toppers SET student_name = ?, exam_name = ?, exam_year = ?, achievement = ?, photo = ?, status = ? WHERE topper_id = ?";
        params = [data.student_name, data.exam_name, data.exam_year || '', data.achievement || '', req.file.filename, data.status || 'active', id];
    } else {
        // Update without changing photo
        sql = "UPDATE toppers SET student_name = ?, exam_name = ?, exam_year = ?, achievement = ?, status = ? WHERE topper_id = ?";
        params = [data.student_name, data.exam_name, data.exam_year || '', data.achievement || '', data.status || 'active', id];
    }

    await exe(sql, params);
    res.redirect('/admin/top_achievements_list');
});

router.get('/toppers_delete/:id', (req, res) => {
    var id = req.params.id;
    // First, fetch the photo filename
    var selectSql = "SELECT photo FROM toppers WHERE topper_id = ?";
    exe(selectSql, [id]).then((result) => {
        if (result.length > 0 && result[0].photo) {
            // Delete the photo file from uploads folder
            fs.unlink('uploads/' + result[0].photo, (err) => {
                if (err) console.error('Error deleting photo:', err);
            });
        }
        // Then delete the record from database
        var deleteSql = "DELETE FROM toppers WHERE topper_id = ?";
        return exe(deleteSql, [id]);
    }).then(() => {
        res.redirect('/admin/top_achievements_list');
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});



router.get('/achievements',(req,res) =>{
    res.render('admin/achivements.ejs')
});

router.get('/exam_achievements_add',(req,res) =>{
    res.render('admin/exam-achievements-add.ejs', {achievement : null});
});


router.post('/exam_achievement_add', async (req,res) => {
    var data = req.body;
    var sql = "INSERT INTO exam_achievements (exam_name, point_1, point_2, point_3) VALUES (?, ?, ?, ?)";
    await exe(sql, [data.exam_name, data.point_1 || '', data.point_2 || '', data.point_3 || '']);
    res.redirect(req.get('referer'));
});

router.get('/exam_achievement_list', async (req,res) => {
    var sql = "SELECT * FROM exam_achievements";
    var achievements = await exe(sql);
    res.render('admin/exam_achievements_list.ejs', {achievements: achievements});
});

router.get('/exam_achievements_edit/:id', (req,res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM exam_achievements WHERE achievement_id = ?";
    exe(sql, [id]).then((result) => {
        res.render('admin/exam-achievements-add.ejs', { achievement: result[0] });
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.post('/exam_achievement_update/:id', async (req,res) => {
    var id = req.params.id;
    var data = req.body;
    var sql = "UPDATE exam_achievements SET exam_name = ?, point_1 = ?, point_2 = ?, point_3 = ?, status = ? WHERE achievement_id = ?";
    await exe(sql, [data.exam_name, data.point_1 || '', data.point_2 || '', data.point_3 || '', data.status || 'active', id]);
    res.redirect(req.get('referer'));
});
router.get('/exam_achievements_delete/:id', (req,res) => {
    var id = req.params.id;
    var sql = "DELETE FROM exam_achievements WHERE achievement_id = ?";
    exe(sql, [id]).then(() => {
        res.redirect('/admin/exam_achievement_list');
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
});

router.get('/success_factors_add', (req, res) =>{
    res.render('admin/students_achieve_success_add.ejs', {factor : null});
});

router.post('/success_factor_add', async (req,res) =>{
    var data = req.body;
    var sql = 'INSERT INTO success_factors (title, description) VALUES (?, ?)';
    await exe(sql, [data.title, data.description]);
    res.redirect(req.get('referer'))
});

router.get('/why_achievement_list', async (req, res) => {
    var sql  = ' SELECT * FROM success_factors';
    var factors = await exe(sql);
    res.render('admin/why_achievement_list.ejs', {factors})
});

router.get('/about_page', (req, res) => {
    res.render('admin/about_us_page.ejs');
});

router.get('/our_journey_add', (req, res) =>{
    res.render('admin/our_journey_add.ejs',{history:null});
});

// router.post('/about-history_add',upload.single('photo'), async (req,res) =>{
//     var d = req.body;
//     var image = req.file ? req.file.filename : '';
//     var sql = 'INSERT INTO (title, description_1, description_2, image) VALUES(?, ?, ?)';
//     var data = await exe(sql, [d.title, d.description_1, d.description_2, image])
// });

router.post('/about-history_add', upload.single('image'), async (req, res) => {
    try {
        var d = req.body;
        var image = req.file ? req.file.filename : '';
        // Corrected SQL: Added table name and fixed VALUES placeholders to match 4 columns
        var sql = 'INSERT INTO about_history (title, description_1, description_2, image) VALUES (?, ?, ?, ?)';
        await exe(sql, [d.title, d.description_1, d.description_2, image]);
        // Added redirect response (adjust path if needed, e.g., to a list page)
        res.redirect('/admin/about_page');  // Or another appropriate route
    } catch (err) {
        console.error('Error in /about-history_add:', err);
        // Handle multer errors specifically
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).send('Unexpected field in file upload.');
        }
        res.status(500).send('Internal Server Error');
    }
});

router.get('/our_journey_list', async (req, res) => {
    var sql = 'SELECT * FROM about_history';
    var data = await exe(sql);
    res.render('admin/our_journey_list.ejs', {data});
});

// router.get('/history_edit/:id', async (req,res) =>{
//     var id = req.params.id
//     var sql = 'SELECT * FROM about_history WHERE history_id = ?';
//     var data = await exe(sql, [id]);
//     res.render('admin/our_journey_add.ejs', {history : data})
// });

router.get('/history_edit/:id', async (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM about_history WHERE history_id = ?';
  const data = await exe(sql, [id]);

  res.render('admin/our_journey_add.ejs', {
    history: data[0]   // ✅ single object
  });
});

router.post('/about-history_update/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const image = req.file ? req.file.filename : null;

    let sql;
    let params;

    if (image) {
      sql = `
        UPDATE about_history 
        SET title = ?, description_1 = ?, description_2 = ?, image = ?, status = ?
        WHERE history_id = ?
      `;
      params = [
        data.title,
        data.description_1,
        data.description_2,
        image,
        data.status,
        id
      ];
    } else {
      sql = `
        UPDATE about_history 
        SET title = ?, description_1 = ?, description_2 = ?, status = ?
        WHERE history_id = ?
      `;
      params = [
        data.title,
        data.description_1,
        data.description_2,
        data.status,
        id
      ];
    }

    await exe(sql, params);
    res.redirect('/admin/our_journey_list');

  } catch (err) {
    console.error(err);
    res.status(500).send("History update failed");
  }
});


router.get('/history_delete/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // 1️⃣ Get image name from DB
    const rows = await exe(
      'SELECT image FROM about_history WHERE history_id = ?',
      [id]
    );

    if (rows.length > 0 && rows[0].image) {
      const imagePath = path.join(__dirname, "../uploads", rows[0].image);

      // 2️⃣ Delete image from folder if exists
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 3️⃣ Delete DB record
    await exe(
      'DELETE FROM about_history WHERE history_id = ?',
      [id]
    );

    res.redirect('/admin/our_journey_list');

  } catch (err) {
    console.error(err);
    res.status(500).send("History delete failed");
  }
});

router.get('/director_add', (req,res) =>{
    res.render('admin/director_add.ejs',{director : null})
});

router.post('/director_add', upload.single('image'), async (req, res) => {
  try {
    const { name, designation, message_1, message_2, status } = req.body;
    const image = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO director_message
      (name, designation, message_1, message_2, image, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await exe(sql, [
      name,
      designation,
      message_1,
      message_2,
      image,
      status
    ]);

    res.redirect('/admin/director_list');

  } catch (err) {
    console.error(err);
    res.status(500).send('Insert Error');
  }
});

// /director_list
router.get('/director_list', async (req, res) => {
  try {
    const data = await exe(
      'SELECT * FROM director_message ORDER BY director_id DESC'
    );

    res.render('admin/director_list.ejs', { data });

  } catch (err) {
    console.error(err);
    res.status(500).send('List Error');
  }
});

router.get('/director_edit/:id', async (req,res)=>{
    try {
    const id = req.params.id;
    const data = await exe(
      'SELECT * FROM director_message WHERE director_id = ?',
      [id]
    );

    res.render('admin/director_add.ejs', {
      director: data[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Edit Page Error');
  }
});

router.post('/director_update/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, designation, message_1, message_2, status } = req.body;
    const image = req.file ? req.file.filename : null;

    let sql;
    let params;

    if (image) {
      sql = `
        UPDATE director_message SET
          name = ?,
          designation = ?,
          message_1 = ?,
          message_2 = ?,
          image = ?,
          status = ?
        WHERE director_id = ?
      `;
      params = [name, designation, message_1, message_2, image, status, id];
    } else {
      sql = `
        UPDATE director_message SET
          name = ?,
          designation = ?,
          message_1 = ?,
          message_2 = ?,
          status = ?
        WHERE director_id = ?
      `;
      params = [name, designation, message_1, message_2, status, id];
    }

    await exe(sql, params);

    res.redirect('/admin/director_list');

  } catch (err) {
    console.error(err);
    res.status(500).send('Update Error');
  }
});

router.get('/director_delete/:id', async (req, res) => {
  try {
    await exe(
      'DELETE FROM director_message WHERE director_id = ?',
      [req.params.id]
    );

    res.redirect('/admin/director_list');

  } catch (err) {
    console.error(err);
    res.status(500).send('Delete Error');
  }
});

router.get('/why_achievement_edit/:id', async (req,res)=>{
    try {
        const id = req.params.id;
        const data = await exe(
            'SELECT * FROM success_factors WHERE factor_id = ?',
            [id]
        );

        res.render('admin/students_achieve_success_add.ejs', {
            factor: data[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Edit Page Error');
    }
});

router.post('/success_factor_update/:id', async (req,res) =>{  
    try {
        const id = req.params.id;
        const { title, description, status } = req.body;
        const sql = `
            UPDATE success_factors SET
            title = ?,
            description = ?,
            status = ?
            WHERE factor_id = ?
        `;
        await exe(sql, [title, description, status, id]);
        res.redirect('/admin/why_achievement_list');
    } catch (err) {
        console.error(err);
        res.status(500).send('Update Error');
    }
});

router.get('/why_achievement_delete/:id', async (req,res) => {
    try {
        const id = req.params.id;
        await exe(
            'DELETE FROM success_factors WHERE factor_id = ?',
            [id]
        );
        res.redirect('/admin/why_achievement_list');
    } catch (err) {
        console.error(err);
        res.status(500).send('Delete Error');
    }
});

module.exports = router;