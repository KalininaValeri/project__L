var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  useref = require('gulp-useref'),
  uglify = require('gulp-uglify'),
  gulpIf = require('gulp-if'),
  del = require('del'),
  babel = require('gulp-babel'),
  plumber = require('gulp-plumber'),
  runSequence = require('run-sequence'),
  autoprefixer = require('gulp-autoprefixer'),
  rename = require('gulp-rename'),
  zip = require('gulp-zip'),
  fs = require('fs-extra'),
  argv = require('yargs').string('slides').argv,
  expect = require('gulp-expect-file'),
  imageResize = require('gulp-image-resize'),
  fileinclude = require('gulp-file-include'),
  replace = require('gulp-replace'),
  dom = require('gulp-dom'),
  sourcemaps = require('gulp-sourcemaps'),

  git = require('simple-git')();

  file = require('fs');
  packInfo = JSON.parse(file.readFileSync('./package.json'));

// should be "correct" IDs, i.e. don't contain spaces, minuses, e.t.c
var slides = {};
var lang = '';
var allLangs = [];
var devScripts = '';
var isBuild = false;

// ************* TEMPLATE UPDATE TASKS *************

gulp.task('update', function(callback) {
  if (fs.existsSync('update')) {
    fs.removeSync('update');
  }
  git.clone('https://bitbucket.org/repointsanofi/presentation-template.git', 'update').then(function() {
    var files = [
      'gulpfile.js',
      'package.json',
      'app/media/builder/',
      'app/html/index.html',
      'app/scripts/dev.js',
      'app/scripts/_cegedim.js',
      'app/scripts/index.js',
      'app/styles/builder.scss',
      'app/styles/index.scss'
    ]

    for (var file of files) {
      fs.removeSync(file);
      fs.moveSync('update/' + file, file);
    }

    if (fs.existsSync('update')) {
      fs.removeSync('update');
    }
    callback();
  });
});

// ************* DEVELOPMENT TASKS *************
function readFileSlides() {
  var file = './app/slides.' + lang + '.json';
  if (!fs.existsSync(file)) {
    throw ('Slides list for lang ' + lang + ' not found :(');
  }

  slides = JSON.parse(fs.readFileSync(file, 'utf8'));
}

function getLangs() {
  var files = fs.readdirSync('app/');
  var reg = /slides\.(\w+)\.json/i;
  for (var i = 0; i < files.length; i++) {
    var match = files[i].match(reg);
    if (match) {
      allLangs.push(match[1]);
    }
  }

  // --lang=kz
  if (argv.lang) {
    lang = argv.lang;
  } else {
    lang = allLangs[0];
  }

  allLangs.splice(allLangs.indexOf(lang), 1);
}

gulp.task('slugify', function() {
  Object.keys(slides).forEach(function(slideKey) {
    var ids = slides[slideKey];
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i].replace(/-| /g, '_').toUpperCase();
      slides[slideKey][i] = id;
      console.log(id);
    }
  });
  console.log(slides);
});

gulp.task('sass', function() {
  var destFolder = 'app/css';
  return gulp.src('app/styles/*.scss')
      .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
      .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['> 1%', 'last 2 versions']
    }))
    .pipe(gulp.dest(destFolder))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  return gulp.src('app/scripts/*.js')
    .pipe(plumber())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('fileinclude', function() {
  return gulp.src(['app/html/*.html', '!app/include/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: 'app/html/include/'
    }))
    .pipe(dom(function() {
      for (var j = 0; j < allLangs.length; j++) {
        var els = this.querySelectorAll('.' + allLangs[j]);
        for (var i = 0; i < els.length; i++) {
          if (isBuild) {
            els[i].parentNode.removeChild(els[i]);
          } else {
            els[i].classList.add('hide');
          }
        }
      }
      return this;
    }))
    .pipe(replace('{{lang}}', lang))
    .pipe(replace('{{alllang}}'), () => {
        return allLangs.slice().push(lang).join()
    })
    .pipe(replace('{{devScripts}}', devScripts))
    .pipe(gulp.dest('app/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('watch', ['browserSync', 'sass'], function() {
  gulp.watch('app/styles/*.scss', ['sass']);
  gulp.watch('app/html/**/*.html', ['fileinclude']);
  gulp.watch('app/scripts/*.js', ['js']);
});

gulp.task('browserSync', function() {
  browserSync({
    port: argv.port || 3000,
    ui: false,
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});


function run(callback) {
  console.log('- - - - verison: '+packInfo.version+' - - - -');
  console.log(packInfo.lalala+"\n**********");

  devScripts =
    '<script src="scripts/dev.js"></script>' +
    '<link rel="stylesheet" href="css/builder.css"/>';

  getLangs();
  readFileSlides();

  runSequence(['fileinclude', 'sass', 'browserSync', 'watch'],
    callback
  );
}
gulp.task('serve', function(callback) {
  console.log('**********\n- - - - !Attention: in newest versions use "gulp" - - - -');
  run(callback);
});
gulp.task('default', function(callback) {
  console.log('**********\n- - - - !Attention: in older versions use "gulp serve" ------');
  run(callback);
});

// ************* BUILD TASKS ***************

var slide; // ex. 'slide-00'
var slideIndex;
var slideNamesIndex;
var slideID; // ex. 'RE_KZSVC150607A_0_0_COVER'
var slideKeys; // slide keys to iterate when building slides


gulp.task('clean', function(callback) {
  del(['dist/slides/*', 'dist/archives/' + lang], callback);
});

gulp.task('useref', function() {
  var assets = useref.assets();

  return gulp.src('app/' + slide + '.html')
    .pipe(assets)
    //.pipe(gulpIf('*.css', minifyCSS()))
    .pipe(gulpIf('*.js', babel({
      presets: ['env']
    })))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulpIf('*.html', rename('index.html')))
    .pipe(replace('{{lang}}', lang))
    .pipe(replace('{{devScripts}}', devScripts))
    .pipe(gulp.dest('dist/slides/' + slide + '/'));
});

// Fonts
gulp.task('copy-fonts', function() {
  return gulp.src(['app/media/fonts/**'])
    .pipe(gulp.dest('dist/slides/' + slide + '/media/fonts'));
});

// Images
gulp.task('copy-images', function() {
  return gulp.src('app/media/images/*.*')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/images'));
});
gulp.task('copy-slide-images', function() {
  return gulp.src('app/media/images/' + slide + '/*.*')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/images/' + slide + '/'));
});
gulp.task('copy-lang-images', function() {
  return gulp.src('app/media/images/' + lang + '/*.*')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/images/' + lang + '/'));
});
gulp.task('copy-slide-lang-images', function() {
  return gulp.src('app/media/images/' + slide + '/' + lang + '/*.*')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/images/' + slide + '/' + lang + '/'));
});

// Video
gulp.task('copy-videos', function() {
  return gulp.src('app/media/videos/' + slide + '/*.*')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/videos/' + slide + '/'));
});
gulp.task('copy-lang-videos', function() {
  return gulp.src('app/media/videos/' + slide + '/' + lang + '/*.*')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/videos/' + slide + '/' + lang + '/'));
});

// PDF
gulp.task('copy-pdf', function() {
  return gulp.src('app/media/pdf/*.pdf')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/pdf/'));
});
gulp.task('copy-slide-pdf', function() {
  return gulp.src('app/media/pdf/' + slide + '/*.pdf')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/pdf/' + slide + '/'));
});
gulp.task('copy-lang-pdf', function() {
  return gulp.src('app/media/pdf/' + lang + '/*.pdf')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/pdf/' + lang + '/'));
});
gulp.task('copy-slide-lang-pdf', function() {
  return gulp.src('app/media/pdf/' + slide + '/' + lang + '/*.pdf')
    .pipe(gulp.dest('dist/slides/' + slide + '/media/pdf/' + slide + '/' + lang + '/'));
});

// Thumb
gulp.task('copy-thumb', function() {
  var srcFile = 'assets/thumbnails/' + lang + '/' + slide + '.jpg';
  var destFolder = 'dist/slides/' + slide + '/media/images/thumbnails/';
  return gulp.src(srcFile)
    .pipe(rename('200x150.jpg'))
    .pipe(gulp.dest(destFolder))
    .pipe(expect(destFolder + '200x150.jpg'));
});

// Export
gulp.task('copy-export-pdf', function() {
  var srcFile = 'assets/export/' + lang + '/' + slide + '.pdf';
  var destFolder = 'dist/slides/' + slide + '/export';
  return gulp.src(srcFile)
    .pipe(rename('export.pdf'))
    .pipe(gulp.dest(destFolder))
    .pipe(expect(destFolder + '/export.pdf'));
});


gulp.task('build-slide', function(callback) {
  runSequence([
    'useref',
    'copy-fonts',

    'copy-images',
    'copy-slide-images',
    'copy-lang-images',
    'copy-slide-lang-images',

    'copy-videos',
    'copy-lang-videos',

    'copy-pdf',
    'copy-slide-pdf',
    'copy-lang-pdf',
    'copy-slide-lang-pdf',

    'copy-thumb',
    'copy-export-pdf'
  ], callback);
});

function updateSlideVars() {
  slide = slideKeys[slideIndex];
  slideID = slides[slide][slideNamesIndex];
}

gulp.task('iteratorReset', function(callback) {
  slideIndex = 0;
  slideNamesIndex = 0;
  updateSlideVars();
  callback();
});

gulp.task('iteratorNextSlide', function(callback) {
  slideIndex++;
  slideNamesIndex = 0;
  updateSlideVars();
  callback();
});

gulp.task('nextSlideName', function(callback) {
  slideNamesIndex++;
  updateSlideVars();
  callback();
});


function buildSlides() {
  var sequence = ['generate-parameters', 'fileinclude', 'sass', 'clean', 'iteratorReset'];

  var i;
  // copy files
  for (i = 0; i < slideKeys.length; i++) {
    sequence.push('build-slide');
    if (i < slideKeys.length - 1) {
      sequence.push('iteratorNextSlide');
    }
  }

  // zip slides
  sequence.push('iteratorReset');
  for (i = 0; i < slideKeys.length; i++) {
    var slideNames = slides[slideKeys[i]];
    for (var j = 0; j < slideNames.length; j++) {
      sequence.push('copy-parameters');
      sequence.push('zip-slide');
      sequence.push('clean-parameters');
      if (j < slideNames.length - 1) {
        sequence.push('nextSlideName');
      }
    }
    if (i < slideKeys.length - 1) {
      sequence.push('iteratorNextSlide');
    }
  }

  //console.log('sequence:', sequence);
  runSequence.apply(this, sequence);
}

function generateAllSlideKeys() {
  slideKeys = [];
  Object.keys(slides).forEach(function(slideKey) {
    slideKeys.push(slideKey);
  });
}

// build one slide: gulp build --slides=01
// build several slides: gulp build --slides=02,05,06
gulp.task('build', function(callback) {
  var ids = argv.slides.split(',');
  isBuild = true;

  getLangs();
  readFileSlides();

  slideKeys = ids.map(function(x) {
    return 'slide-' + x;
  });

  buildSlides();
  callback();
});


// build all slides
// --lang=kz
gulp.task('build-all', function(callback) {
  isBuild = true;

  getLangs();
  readFileSlides();

  generateAllSlideKeys();
  buildSlides();
  callback();
});

gulp.task('generate-parameters', function(callback) {
  for (var i = 0; i < slideKeys.length; i++) {
    slideIndex = i;
    updateSlideVars();
    var slideNames = slides[slide];
    for (var j = 0; j < slideNames.length; j++) {
      slideNamesIndex = j;
      updateSlideVars();

      var fileName = __dirname + '/assets/parameters/' + slideID + '.xml';

      if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName,
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<Sequence Id="' + slideID + '" xmlns="urn:param-schema">\n' +
          '</Sequence>');
      }
    }
  }
  callback();
});

gulp.task('copy-parameters', function() {
  var srcFile = 'assets/parameters/' + slideID + '.xml';
  var destFolder = 'dist/slides/' + slide + '/parameters';
  return gulp.src(srcFile)
    .pipe(rename('parameters.xml'))
    .pipe(gulp.dest(destFolder))
    .pipe(expect(destFolder + '/parameters.xml'));

});

gulp.task('clean-parameters', function(callback) {
  del(['dist/slides/' + slide + '/parameters'], callback);
});


gulp.task('zip-slide', function() {
  var archiveName = slideID + '.zip';
  console.log('zip:', archiveName);
  return gulp.src('dist/slides/' + slide + '/**')
    .pipe(zip(archiveName))
    .pipe(gulp.dest('dist/archives/' + lang));
});

gulp.task('make-thumbs', function() {
  getLangs();
  return gulp.src('app/media/screenshots/' + lang + '/*.*')
    .pipe(imageResize({
      width: 200,
      height: 150,
      quality: 1,
      // imageMagick: true,
      format: 'jpg'
    }))
    .pipe(gulp.dest('assets/thumbnails/' + lang));
});

gulp.task('make-export', function() {
  getLangs();
  return gulp.src('app/media/screenshots/' + lang + '/*.*')
    .pipe(imageResize({
      width: 1024,
      height: 768,
      quality: 1,
      imageMagick: true,
      format: 'pdf'
    }))
    .pipe(gulp.dest('assets/export/' + lang));
});

gulp.task('add', function(callback) {
  if (argv.langs) {
    var langs = argv.langs.split(',');

    if (langs.length === 0) {
      callback();
    }

    getLangs();

    var slidesJson = fs.readFileSync('app/slides.' + lang + '.json', 'utf8');
    var flowJs = fs.readFileSync('app/scripts/flow.' + lang + '.js', 'utf8');

    for (var i = 0; i < langs.length; i++) {

      var file = 'app/slides.' + langs[i] + '.json';
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, slidesJson);
      }

      file = 'app/scripts/flow.' + langs[i] + '.js';
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, flowJs);
      }
    }

    console.log('Add languages ' + argv.langs);
  }

  if (argv.slides) {
    var scss =
      '$slide: \'{n}\';\n' +
      '@import \'_engine\';\n' +
      '.#{$slide} {\n\n' +
      '}\n' +
      '// animations\n' +
      '.#{$slide} {\n\n' +
      '\n// inital state\n' +
      '\t&.slide-active {\n' +
      '\t\t// active state\n' +
      '\t}\n' +
      '}';

    var html =
      '@@include(\'header.html\', {"slide-id": "{n}"})\n' +
      '<!-- main pop-up -->\n' +
      '<div class="popup" id="popup-info">\n' +
      '\t<div class="close"></div>\n' +
      '\t<div class="content">\n' +
      '\t\t<div class="popup-title"></div>\n' +
      '\t</div>\n' +
      '</div>\n\n' +
      '@@include(\'footer.html\', {"slide-id": "{n}"})';

    var js =
      '/* global cegedim*/\n' +
      '$(function() {\n\n' +
      '});';

    var newSlides = [];

    if (argv.slides.indexOf('n') > -1) {
      var n = parseInt(argv.slides.slice(1));

      var lastSlide = 0;
      var files = fs.readdirSync('app/html/');
      var reg = /slide\-(\d+)\.html/i;
      for (var i = 0; i < files.length; i++) {
        var match = files[i].match(reg);
        if (match) {
          lastSlide = parseInt(match[1]);
        }
      }

      for (var i = lastSlide; i <= n + lastSlide; i++) {
        var name = i;
        if (i < 10) {
          name = '0' + name;
        }

        newSlides.push('slide-' + name);
      }

      console.log('Add ' + n + ' slides.');
    } else {
      var s = argv.slides.split(',');

      for (var i = 0; i < s.length; i++) {
        var name = parseInt(s[i]);
        if (name < 10) {
          name = '0' + name;
        }

        newSlides.push('slide-' + name);
      }

      console.log('Add ' + argv.slides + ' slides.');
    }

    for (var i = 0; i < newSlides.length; i++) {
      var name = newSlides[i];

      var file = 'app/styles/' + name + '.scss';
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, scss.replace(/\{n\}/g, name));
      }

      file = 'app/html/' + name + '.html';
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, html.replace(/\{n\}/g, name));
      }

      file = 'app/scripts/' + name + '.js';
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, js);
      }

      var dir = 'app/media/images/' + name;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    }
  }

  callback();
});

gulp.task('remove', function(callback) {
  if (argv.slides) {
    var removeSlides = [];


    var s = argv.slides.split(',');

    for (var i = 0; i < s.length; i++) {
      var name = parseInt(s[i]);
      if (name < 10) {
        name = '0' + name;
      }

      removeSlides.push('slide-' + name);
    }

    console.log('Remove ' + argv.slides + ' slides.');
  }

  for (var i = 0; i < removeSlides.length; i++) {
    var name = removeSlides[i];

    var file = 'app/styles/' + name + '.scss';
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    file = 'app/html/' + name + '.html';
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    file = 'app/scripts/' + name + '.js';
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    fs.removeSync('app/media/images/' + name);
  }

  callback();
});

gulp.task('help', function() {
  console.log(
    '*********************************************************************************************\n'+
    '\n'+
    'HELP\n'+
    '\n'+
    'gulp [--lang=ru] [--port=4000]   - Запуск презентации [с русским языком] [на 4000 порту]\n'+
    '(gulp serve [--lang=ru] [--port=4000] в версии шаблона 1.0.0 и раньше)\n'+
    '\n'+
    'gulp add --lang=az               - Добавить "az" язык\n'+
    'gulp add --slides=nX             - Добавить X слайдов\n'+
    'gulp add --slides=2[,8,10]       - Добавить слайды под номерами 2,8,10\n'+
    '\n'+
    'gulp make-thumbs [--lang=ru]     - Создание превью из скриншотов [с русским языком]\n'+
    'gulp make-export [--lang=ru]     - Создание export.pdf из скриншотов [с русским языком]\n'+
    '\n'+
    'gulp build-all [--lang=ru]       - Сборка всех слайдов [с русским языком]\n'+
    'gulp build --slides=02[,08,10]   - Сборка определённых слайдов\n'+
    '\n'+
    'gulp remove --slides=2[,8,10]    - Удаляет слайды под номерами 2,8,10\n'+
    '\n'+
    'gulp update                      - Обновление исполняемого файла\n'+
    '\n'+
    '*********************************************************************************************'
  );
});

gulp.task('info', function() {
  console.log(
    '*********************************************************************************************\n'+
    '\n'+
    'INFO\n'+
    '\n'+
    packInfo.lalala+
    '\n'+
    'info:    '+packInfo.description+'\n'+
    'version: '+packInfo.version+'\n'+
    'author:  '+packInfo.author+'\n\n'+
    packInfo.rights+'\n\n'+
    '*********************************************************************************************'
  );
});
