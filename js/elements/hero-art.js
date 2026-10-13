// Pixel art for the main character (Jackson): white oversized tee, baggy
// blue jeans, messy dark hair and a beard. Traced from the character sheets
// and reduced to a 48px-tall NES-style sprite (the front face is hand-drawn). One character per pixel;
// '.' is transparent and every letter is a color from `colors`.

export const HERO_ART = {
    colors: {
        A: '#241c1e', // hair, dark
        B: '#142a4e', // jeans, darkest
        C: '#193562', // jeans, dark
        D: '#473735', // hair / beard, brown
        E: '#1e4178', // jeans, shadow
        F: '#254d8a', // jeans
        G: '#2d5a9c', // jeans, light
        H: '#866958', // skin, shadow
        I: '#9e9796', // grey (shirt folds, shoes)
        J: '#dc9562', // skin
        K: '#cbc3c0', // shirt, shadow
        L: '#e6dcd8', // shirt, white
    },

    // Facing the viewer (standing still)
    front: [
        '........A.A........',  // messy hair tips
        '......AAAAAAA......',
        '.....ADAAAAADA.....',
        '....AADADDDADAA....',
        '....AAAJAAAJAAA....',  // fringe falling over the forehead
        '....AJJJJJJJJJA....',  // forehead
        '....AJAAJJJAAJA....',  // eyebrows
        '....AJJAJJJAJJA....',  // eyes
        '....DJJJJHJJJJD....',  // nose (covered by faceDetail)
        '....DDJJJJJJJDD....',  // cheeks, beard along the jaw (covered by faceDetail)
        '.....DDAAAAADD.....',  // mustache (covered by faceDetail)
        '.....DDJHHHJDD.....',  // mouth (covered by faceDetail)
        '......DDDADDD......',  // chin beard (covered by faceDetail)
        '......IHJJJHI......',  // neck
        '...KKKKIHHHKLLK....',
        '..ILLLLKIKKLLLLK...',
        '..LLLLLLLLLLLLLLK..',
        '.KLKLLLLLLLLLLKLL..',
        '.LKKLLLLLLLLLLKLL..',
        '.LLKLLLLLLLLLLKKLI.',
        'ILLKLLLLLLLLLKKKLK.',
        'KLLKKLLLLLLLLKILLK.',
        'LLKIKLLLLLLLLKILLLI',
        'LKKIKLLLLLLLKKIKLK.',
        '.HHHKLKLLLLLKKHHH..',
        '.JJDKLKLLLLLKLDJJ..',
        '.JJDKKLLLLLLLKDJJH.',
        '.JJDKLLLLLKLLKDHJH.',
        '.JJHKKLLLLLLKKIHJ..',
        '.JJIKLLKLLLKKLIJJ..',
        '.JJDILKLLKKKKIDHJ..',
        '.JHBFEHHHHHEFGCDJ..',
        '..HEFGFECBCGGGCJ...',
        '...EGGGFCCEGGGE....',
        '...FGGGFCCFGGGE....',
        '...FGGGFCBFFGGF....',
        '...GGGFECBFFGGFB...',
        '...GGGEE..EFGGGB...',
        '...EGGFE..CFGFG....',
        '...FGGFFB.BFGGE....',
        '...GGFEEB.EFFGEB...',
        '..EGGGCECBGGFFGE...',
        '..EEFFFE..EFEEFG...',
        '..BEFFEE..CEEGFC...',
        '..FHDEEC..CEFFHE...',
        '..IIHKEB..CFKHIH...',
        '.HIIDII....IIHIIH..',
        '.KKKKII....IIIKKK..',
    ],

    // Waving his right hand (on the viewer's right): the whole arm is raised
    // straight from the shoulder and rocks between two angles.
    // 4 empty columns on each side keep the body lined up with `front`.
    frontWaving: [
        [
            '............A.A............',
            '..........AAAAAAA.........J',
            '.........ADAAAAADA.......JJ',
            '........AADADDDADAA.....JJH',
            '........AAAJAAAJAAA....JJJH',
            '........AJJJJJJJJJA....JJH.',
            '........AJAAJJJAAJA....JJH.',
            '........AJJAJJJAJJA...JJH..',
            '........DJJJJHJJJJD...JJH..',
            '........DDJJJJJJJDD..JJH...',
            '.........DDAAAAADD...JJH...',
            '.........DDJHHHJDD...JJH...',
            '..........DDDADDD...LLLK...',
            '..........IHJJJHI..LLLLK...',
            '.......KKKKIHHHKLLLLLLK....',
            '......ILLLLKIKKLLKLLLLK....',
            '......LLLLLLLLLLLKLLLLK....',
            '.....KLKLLLLLLLLKLLLLK.....',
            '.....LKKLLLLLLLLLL.........',
            '.....LLKLLLLLLLLLL.........',
            '....ILLKLLLLLLLLLK.........',
            '....KLLKKLLLLLLLLK.........',
            '....LLKIKLLLLLLLLK.........',
            '....LKKIKLLLLLLLKK.........',
            '.....HHHKLKLLLLLKK.........',
            '.....JJDKLKLLLLLKL.........',
            '.....JJDKKLLLLLLLK.........',
            '.....JJDKLLLLLKLLK.........',
            '.....JJHKKLLLLLLKK.........',
            '.....JJIKLLKLLLKKL.........',
            '.....JJDILKLLKKKKI.........',
            '.....JHBFEHHHHHEFGC........',
            '......HEFGFECBCGGGCJ.......',
            '.......EGGGFCCEGGGE........',
            '.......FGGGFCCFGGGE........',
            '.......FGGGFCBFFGGF........',
            '.......GGGFECBFFGGFB.......',
            '.......GGGEE..EFGGGB.......',
            '.......EGGFE..CFGFG........',
            '.......FGGFFB.BFGGE........',
            '.......GGFEEB.EFFGEB.......',
            '......EGGGCECBGGFFGE.......',
            '......EEFFFE..EFEEFG.......',
            '......BEFFEE..CEEGFC.......',
            '......FHDEEC..CEFFHE.......',
            '......IIHKEB..CFKHIH.......',
            '.....HIIDII....IIHIIH......',
            '.....KKKKII....IIIKKK......',
        ],
        [
            '............A.A............',
            '..........AAAAAAA.....J....',
            '.........ADAAAAADA....JJ...',
            '........AADADDDADAA..JJH...',
            '........AAAJAAAJAAA.JJJH...',
            '........AJJJJJJJJJA.JJH....',
            '........AJAAJJJAAJA.JJH....',
            '........AJJAJJJAJJA.JJH....',
            '........DJJJJHJJJJD.JJH....',
            '........DDJJJJJJJDD.JJH....',
            '.........DDAAAAADD.JJH.....',
            '.........DDJHHHJDD.JJH.....',
            '..........DDDADDD.LLLK.....',
            '..........IHJJJHI.LLLLK....',
            '.......KKKKIHHHKLLLLLLK....',
            '......ILLLLKIKKLLKLLLLK....',
            '......LLLLLLLLLLLKLLLLK....',
            '.....KLKLLLLLLLLKLLLLK.....',
            '.....LKKLLLLLLLLLL.........',
            '.....LLKLLLLLLLLLL.........',
            '....ILLKLLLLLLLLLK.........',
            '....KLLKKLLLLLLLLK.........',
            '....LLKIKLLLLLLLLK.........',
            '....LKKIKLLLLLLLKK.........',
            '.....HHHKLKLLLLLKK.........',
            '.....JJDKLKLLLLLKL.........',
            '.....JJDKKLLLLLLLK.........',
            '.....JJDKLLLLLKLLK.........',
            '.....JJHKKLLLLLLKK.........',
            '.....JJIKLLKLLLKKL.........',
            '.....JJDILKLLKKKKI.........',
            '.....JHBFEHHHHHEFGC........',
            '......HEFGFECBCGGGCJ.......',
            '.......EGGGFCCEGGGE........',
            '.......FGGGFCCFGGGE........',
            '.......FGGGFCBFFGGF........',
            '.......GGGFECBFFGGFB.......',
            '.......GGGEE..EFGGGB.......',
            '.......EGGFE..CFGFG........',
            '.......FGGFFB.BFGGE........',
            '.......GGFEEB.EFFGEB.......',
            '......EGGGCECBGGFFGE.......',
            '......EEFFFE..EFEEFG.......',
            '......BEFFEE..CEEGFC.......',
            '......FHDEEC..CEFFHE.......',
            '......IIHKEB..CFKHIH.......',
            '.....HIIDII....IIHIIH......',
            '.....KKKKII....IIIKKK......',
        ],
    ],

    // Fine face details, drawn with pixels HALF the normal size on top of the
    // front-facing frames (so the beard can be thinner than one game pixel).
    // x/y is where they start on the `front` grid, in normal pixels; each
    // normal pixel is 2x2 of these. This covers the nose down to the chin.
    faceDetail: {
        x: 4,
        y: 8,
        rows: [
            'DJJJJJJJJJHHJJJJJJJJJD',  // nose
            'DJJJJJJJJHHHHJJJJJJJJD',
            'DDJJJJJJJJJJJJJJJJJJDD',  // thin beard along the jaw
            '.DDJJJJJJJJJJJJJJJJDD.',
            '..DDJJJJAAAAAAJJJJDD..',  // mustache
            '..DJJJAAJJJJJJAAJJJD..',
            '..DJJJAJHHHHHHJAJJJD..',  // mouth
            '..DDJJJJJJJJJJJJJJDD..',
            '....DDJJJAAAAJJJDD....',  // chin beard
            '......DDDAAAADDD......',
        ],
    },

    // Side view, facing right, upper body only (walking; mirrored for left).
    // The legs below are drawn separately so they can swing.
    side: [
        '....AAAA.A...',
        '...DDAAAAAA..',
        '..DDAAAAAAAA.',
        '.DDDDDDADAADA',
        '.DDDDDDDDADDD',
        'DAAAADDDADDAD',
        '.DDAAAAAAHHAA',
        'DDAAAAAAHDD..',
        'AAAAHAAHJDJ..',
        '.AAAJHDJJJJJ.',
        '.AAADHHJJJH..',
        '.AAAAHDDHHH..',
        '.AAAAJJADD...',
        '..AADJJH.....',
        '..HLLKJH.....',
        '..ILLLKK.....',
        '.HLLLLLLK....',
        '.ILLLLLLLD...',
        '.LKLLLKLLK...',
        '.LKLLLLKKK...',
        'HKKLLLLIKKH..',
        'IKLLLLLIKLI..',
        'IILLLLLILLI..',
        'IILLLLLIKLK..',
        'KIKLLLLKILK..',
        'KIKLLLLLILK..',
        'KKIIIIADKLK..',
        'KLIDHJJIKLK..',
        'KKKHJJJHKKK..',
        'ILKKDJJHKKI..',
        'KLKLHJJJHLK..',
        'KLKHAHJJAIK..',
        'KDCFFDHDFC...',
    ],

    // Side-view legs, hip at the top, 3 rows of shoe at the bottom.
    // The back leg is darker because it's further away.
    sideBackLeg: [
        'CEEEEB.',
        'CEEEEB.',
        'CEEECB.',
        'CEEECB.',
        'BEEECB.',
        'BEEECB.',
        'BEECCB.',
        'CEECCB.',
        'CEECCB.',
        'EEECBB.',
        'EECCBB.',
        'BCCBBBB',
        'DIIIKI.',
        'DIKKKKI',
        'IKKKKKI',
    ],
    sideFrontLeg: [
        'FGGGGE.',
        'FGGGGE.',
        'FGGGFE.',
        'FGGGFE.',
        'EGGGFE.',
        'EGGGFE.',
        'EGGFFE.',
        'FGGFFE.',
        'FGGFFC.',
        'GGGFEC.',
        'GGFFEC.',
        'CFFEECC',
        'DIIILI.',
        'DILLLLI',
        'ILLLLLL',
    ],
    // Where the hanging hand is in `side` (rows and columns, inclusive), so it
    // can be painted over when both hands are needed elsewhere (e.g. riding)
    sideHand: { fromRow: 26, toRow: 32, fromCol: 3, toCol: 8, skin: 'JHAD', cover: 'K', coverBelt: 'F' },
    // Where each leg's left edge sits under the side-view body
    sideLegX: { back: 1, front: 3 },

    // From behind (going into a door)
    back: [
        '.......AA.AA.......',
        '.....AAAAAAAD......',
        '.....DAAAAAAAD.....',
        '....DDDAAAADDDD....',
        '...ADDDDDDDDDDA....',
        '....DADDDDDDDDD....',
        '...DAAADDDDDADD....',
        '...AAAADAAAAAAA....',
        '....DAAAAAAAAAD....',
        '....AAAAAAAAAAA....',
        '.....AAAAAAAAAA....',
        '.....AAAAAAAAA.....',
        '.....A..AAAA.......',
        '.....KLIHHJIKI.....',
        '...IKLLLLLKLLLLK...',
        '..HLLLLLLLLLLLLLI..',
        '..KLLLLLLLLLLLLLK..',
        '.HLLLLLLLLLLLLKLK..',
        '.ILLLLLLLLLLLLKLLK.',
        '.KLLLLLLLLLLLLKKLI.',
        'HLLKKLLLLLLLLLKLLLH',
        'HLLKKLLLLLLLLLILLLI',
        'HLLKKLLLKLLLLLILLLH',
        'KLLKKLLLKLLLLLIKLLL',
        'LLLKKLLLKLLLLLIKLLL',
        'KKLKKLLKLLLLLKIKLLI',
        '..IHKLLKLLLLLKIHI..',
        '..HHLLKLLLLLKKIDH..',
        '...KLKLLLLLLLLKHJ..',
        '...KKLLLLLLLLLKHH..',
        '...LLLKKLLKKKLLIH..',
        '...HKLLLLLLLLKIHH..',
        '...BBFHIIIIIHBED...',
        '...EFFECB.BCEGGC...',
        '...GGGGEBBEFGGGE...',
        '...GGGGFCBFGGGGE...',
        '..BFGGGFCBEGGGGE...',
        '..FGGGGFEBEFGGGE...',
        '..GGGGFGC.FFGGGG...',
        '..GGGGGGB.FGGGGE...',
        '..FGGGGFBBGGGGFE...',
        '.CFGGGFEBBFGGGEFE..',
        '.EGFGFFECCEFFFFGE..',
        '..FFGGFEBBFGFGGE...',
        '..EFEFEC..CEFFFF...',
        '.IDEGGGE..EFGGCHKD.',
        '.IHKIIII..HIIIIHII.',
        '.IILLLLI..KLLLLKI..',
    ],
};
