const gulp = require('gulp');       // Подключаем сам Gulp
const fileInclude = require('gulp-file-include');      // Подключаем HTML файлы
const sass = require('gulp-sass')(require('sass'));     // Компиляция sass в css
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');  // Удаляет (синхронизация папки dist с папкой src)
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');  
const cleanCSS = require('gulp-clean-css');
// const groupMedia = require('gulp-group-css-media-queries'); если писать отдельно медиа в каждом файле
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

gulp.task('clean', function(done){
    if (fs.existsSync('./dist/')) {
        return gulp.src('./dist/', {read: false})
        .pipe(clean());
    }
    done();
});

const fileIncludeSetting = {
    prifix: '@@',
    basepath: '@file',
};

const serverOptions = {
    livereload: true,
    open: true
};

const plumberHTMLConfig = {
    errorHandler: notify.onError({
        title: 'HTML',
        message: 'Error <%= error.massege %>',
        sound: false
    }),
};

gulp.task('html', function(){
    return gulp
        .src('./src/*.html')         //Взяли файл (даже если несколько)
        .pipe(plumber(plumberSassConfig))   // Продолжает работу при ошибке
        .pipe(fileInclude(fileIncludeSetting))  // Обработали через настройки в const fileIncludeSetting
        .pipe(gulp.dest('./dist/'))     // Сохранили готовые файлы
});

const plumberSassConfig = {
    errorHandler: notify.onError({
        title: 'Styles',
        message: 'Error <%= error.massege %>',
        sound: false
    })
};

gulp.task('sass', function() {
    return gulp
    .src('./src/sass/*.{sass,scss}') // обрабатываем файлы с расширениями .sass и .scss
    .pipe(plumber(plumberSassConfig))
    .pipe(sourceMaps.init())
    .pipe(sass())
    //.pipe(groupMedia())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('./dist/css')) // сохраняем полноценный CSS
    .pipe(cleanCSS()) // сжимаем CSS
    .pipe(rename('style.min.css')) // переименовываем
    .pipe(gulp.dest('./dist/css')); // сохраняем сжатый CSS
});

// Копирование изображений
gulp.task('images', function(){
    return gulp.src('./src/img/**/*')
    .pipe(gulp.dest('./dist/img/'))
});

// Копирование шрифтов
gulp.task('fonts', function(){
    return gulp.src('./src/fonts/**/*')
    .pipe(gulp.dest('./dist/fonts/'))
});

// Копирование файлов (которые пользователь сможет скачть pdf, rar, zip и т.д.)
gulp.task('files', function(){
    return gulp.src('./src/files/**/*')
    .pipe(gulp.dest('./dist/files/'))
});

gulp.task('server', function(){
    return gulp.src('./dist/')
    .pipe(server(serverOptions))
});

gulp.task('watch', function(){      //Следим за файлами и сразу меняем, удаляет dist после перезапуска
    gulp.watch('./src/sass/**/*.sass', gulp.parallel('sass'));  // Файлы sass
    gulp.watch('./src/**/*.html', gulp.parallel('html'));   // Файлы html
    gulp.watch('./src/img/**/*', gulp.parallel('images'));  // Файлы все картинки
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts'));  // Файлы все fonts
    gulp.watch('./src/files/**/*', gulp.parallel('files'));  // Файлы files
});

gulp.task('default', gulp.series(
    'clean',
    gulp.parallel('html', 'sass', 'images', 'fonts', 'files'),
    gulp.parallel('server', 'watch')
    ));