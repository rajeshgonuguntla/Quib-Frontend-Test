import { numberedLessonTitle, withoutLessonNumberPrefix } from './lessonTitle';

console.assert(withoutLessonNumberPrefix('#1 Java Introduction') === 'Java Introduction');
console.assert(withoutLessonNumberPrefix('#1 #1 Java Introduction') === 'Java Introduction');
console.assert(withoutLessonNumberPrefix('1. Variables in Java') === 'Variables in Java');
console.assert(withoutLessonNumberPrefix('ISO 27001 Guide') === 'ISO 27001 Guide');
console.assert(numberedLessonTitle(0, '#1 Java Introduction') === '#1 Java Introduction');
console.assert(numberedLessonTitle(4, 'Variables in Java') === '#5 Variables in Java');
console.log('lessonTitle ok');
