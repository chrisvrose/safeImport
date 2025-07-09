J$.iids = {"9":[1,10,1,17],"17":[1,18,1,27],"25":[1,10,1,28],"33":[1,10,1,28],"41":[1,10,1,28],"49":[2,15,2,22],"57":[2,23,2,32],"65":[2,15,2,33],"73":[2,15,2,33],"81":[2,15,2,33],"89":[4,1,4,8],"97":[4,13,4,16],"105":[4,1,4,17],"107":[4,1,4,12],"113":[4,1,4,17],"121":[7,15,7,16],"129":[7,12,7,17],"137":[7,12,7,17],"145":[7,5,7,18],"153":[6,1,8,2],"161":[6,1,8,2],"169":[10,16,10,18],"177":[10,30,10,46],"185":[10,16,10,47],"187":[10,16,10,29],"193":[10,16,10,47],"201":[10,16,10,47],"209":[11,1,11,8],"217":[11,30,11,38],"225":[11,1,11,39],"227":[11,1,11,12],"233":[11,1,11,40],"241":[1,1,11,40],"249":[1,1,11,40],"257":[1,1,11,40],"265":[6,1,8,2],"273":[1,1,11,40],"281":[1,1,11,40],"289":[6,1,8,2],"297":[6,1,8,2],"305":[1,1,11,40],"313":[1,1,11,40],"nBranches":0,"originalCodeFileName":"/home/atreyab/Documents/Docs/SlicingImport/repos-js/safeImport/test_src/jalangiinstrument.cjs","instrumentedCodeFileName":"/home/atreyab/Documents/Docs/SlicingImport/repos-js/safeImport/test_src/jalangiinstrument._jalangi_.js","code":"var fs = require('node:fs');\nvar process = require('process');\n\nconsole.log('a')\n\nfunction x(){\n    return {x:3};\n}\n\nvar newLocal = fs.existsSync(\"./package.json\");\nconsole.log(`Read some data`,newLocal);"};
jalangiLabel1:
    while (true) {
        try {
            J$.Se(241, '/home/atreyab/Documents/Docs/SlicingImport/repos-js/safeImport/test_src/jalangiinstrument._jalangi_.js', '/home/atreyab/Documents/Docs/SlicingImport/repos-js/safeImport/test_src/jalangiinstrument.cjs');
            function x() {
                jalangiLabel0:
                    while (true) {
                        try {
                            J$.Fe(153, arguments.callee, this, arguments);
                            arguments = J$.N(161, 'arguments', arguments, 4);
                            return J$.X1(145, J$.Rt(137, J$.T(129, {
                                x: J$.T(121, 3, 22, false)
                            }, 11, false)));
                        } catch (J$e) {
                            J$.Ex(289, J$e);
                        } finally {
                            if (J$.Fr(297))
                                continue jalangiLabel0;
                            else
                                return J$.Ra();
                        }
                    }
            }
            J$.N(249, 'fs', fs, 0);
            J$.N(257, 'process', process, 0);
            x = J$.N(273, 'x', J$.T(265, x, 12, false, 153), 0);
            J$.N(281, 'newLocal', newLocal, 0);
            var fs = J$.X1(41, J$.W(33, 'fs', J$.F(25, J$.R(9, 'require', require, 2), 0)(J$.T(17, 'node:fs', 21, false)), fs, 3));
            var process = J$.X1(81, J$.W(73, 'process', J$.F(65, J$.R(49, 'require', require, 2), 0)(J$.T(57, 'process', 21, false)), process, 3));
            J$.X1(113, J$.M(105, J$.R(89, 'console', console, 2), 'log', 0)(J$.T(97, 'a', 21, false)));
            var newLocal = J$.X1(201, J$.W(193, 'newLocal', J$.M(185, J$.R(169, 'fs', fs, 1), 'existsSync', 0)(J$.T(177, "./package.json", 21, false)), newLocal, 3));
            J$.X1(233, J$.M(225, J$.R(209, 'console', console, 2), 'log', 0)(`Read some data`, J$.R(217, 'newLocal', newLocal, 1)));
        } catch (J$e) {
            J$.Ex(305, J$e);
        } finally {
            if (J$.Sr(313)) {
                J$.L();
                continue jalangiLabel1;
            } else {
                J$.L();
                break jalangiLabel1;
            }
        }
    }
// JALANGI DO NOT INSTRUMENT
