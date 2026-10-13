// Facts about me, and the text built from them. Age and experience are
// worked out from today's date, so they never go out of date.

export const DATE_OF_BIRTH = new Date(1994, 8, 27); // 27 Sep 1994 (months count from 0)
export const CAREER_START_YEAR = 2015;

export const EMAIL = 'jackson.joseph.naik@gmail.com';
export const PHONE = '+918105275714';
export const PHONE_DISPLAY = '+91 8105275714'; // how the number is shown
export const RESUME_FILE_ID = '1rIAE8iLwvM2XMTwXAoGmUACRkczJrgIQ'; // Google Drive

// Buttons in the top-right corner, shown on every scene.
export const LINKS = [
    { label: 'DOWNLOAD RESUME', href: `https://drive.google.com/uc?export=download&id=${RESUME_FILE_ID}`, newTab: true },
    { label: PHONE_DISPLAY, href: `tel:${PHONE}` },
    { label: EMAIL, href: `mailto:${EMAIL}` }
];

// Full years since my date of birth.
export function ageToday(today = new Date()) {
    let age = today.getFullYear() - DATE_OF_BIRTH.getFullYear();
    const birthdayThisYear = new Date(today.getFullYear(), DATE_OF_BIRTH.getMonth(), DATE_OF_BIRTH.getDate());
    if (today < birthdayThisYear) age -= 1;
    return age;
}

// Years since I started working.
export function yearsOfExperience(today = new Date()) {
    return today.getFullYear() - CAREER_START_YEAR;
}

// Written on the sign boards over the street's doors.
export const WORK_TITLE = 'WORK EXPERIENCE';

// Places I worked, in the order of the buildings along the street (oldest first).
export const WORK = [
    {
        company: 'Robosoft Technologies Pvt. Ltd.',
        title: 'Senior Software Developer',
        dates: 'May 2015 - April 2020',
        location: 'Santhekatte, Udupi'
    },
    {
        company: 'SugarBox Networks',
        parent: 'Margo Networks Pvt Ltd',
        title: 'Senior Engineer',
        dates: 'May 2020 - October 2021',
        location: 'Mumbai, India'
    },
    {
        company: 'Grassdoor Logistics Technologies Pvt Ltd',
        title: 'Lead Software Engineer',
        dates: 'Nov 2021 - April 2023',
        location: 'Goa, India (Remote)'
    },
    {
        company: 'Alertdriving',
        title: 'Independent Contractor (Frontend Development)',
        dates: 'Nov 2023 - Present',
        location: 'Mumbai, India (Remote)'
    }
];

// Technical skills, shown as pills on the living room wall, under a plaque.
export const SKILLS_TITLE = 'TECHNICAL SKILLS';
export const SKILLS = [
    {
        title: 'Frontend',
        items: ['HTML 5', 'CSS 3', 'JavaScript ES5/ES6', 'Angular (v2+)', 'AngularJS', 'jQuery',
            'Bootstrap 3/4', 'D3.js', 'Apache Cordova', 'Ionic']
    },
    {
        title: 'Backend',
        items: ['Node.JS', 'Express.js', 'MongoDB', 'MySQL', 'Vanilla PHP', 'Mongoose', 'Sequelize',
            'Krakend gateway']
    },
    {
        title: 'Operating Systems',
        items: ['Mac OS', 'Linux', 'Windows']
    },
    {
        title: 'Tools',
        items: ['GIT', 'JIRA', 'InVision', 'GNU GIMP', 'Inkscape']
    }
];

// The greeting above the intro. Plain strings are normal text; an object
// gets its own class so it can be styled differently (see .name in style.css).
export const INTRO_HEADING = ['Hi !, Im ', { text: 'Jackson', className: 'name' }];

// The intro shown on the first floor, one string per paragraph.
export function introParagraphs() {
    return [
        `I am a ${ageToday()} years old, Web / Hybrid mobile app developer,`,
        `with over ${yearsOfExperience()}+ years of experience in JavaScript, CSS and frameworks based on the same.`,
        'I have worked with the AngularJS and Angular (v2+) framework based projects for about 5+ years.',
        'Lot of these apps have been mobile apps developed using the Apache Cordova / Ionic frameworks.',
        'In January 2021, I started working on projects based on the Node.js environment as well.',
        'Late 2023, switched back to frontend (Vue.JS / Ionic)'
    ];
}
