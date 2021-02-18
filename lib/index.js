"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var utils_1 = require("./utils");
var execa_1 = __importDefault(require("execa"));
var chalk_1 = __importDefault(require("chalk"));
var saveRecord_1 = __importDefault(require("./config/saveRecord"));
var parse_1 = __importDefault(require("./utils/parse"));
var HlinkError_1 = __importDefault(require("./utils/HlinkError"));
var resolvePath = path_1.default.resolve;
function hardLink(input, options) {
    return __awaiter(this, void 0, void 0, function () {
        function start(currentDir, currentLevel) {
            var _this = this;
            if (currentLevel === void 0) { currentLevel = 1; }
            if (currentLevel > maxFindLevel) {
                return;
            }
            var currentDirContents = fs_extra_1.default.readdirSync(currentDir);
            currentDirContents.forEach(function (name) { return __awaiter(_this, void 0, void 0, function () {
                var extname, fileFullPath, realDestPath, linkPaths, sourceNameForMessage, destNameForMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            extname = path_1.default
                                .extname(name)
                                .replace('.', '')
                                .toLowerCase();
                            fileFullPath = resolvePath(currentDir, name);
                            if (!fs_extra_1.default.lstatSync(fileFullPath).isDirectory()) return [3 /*break*/, 3];
                            if (!!name.startsWith('.')) return [3 /*break*/, 2];
                            return [4 /*yield*/, start(fileFullPath, currentLevel + 1)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [3 /*break*/, 4];
                        case 3:
                            if (isWhiteList
                                ? exts.indexOf(extname) > -1
                                : excludeExts.indexOf(extname) === -1) {
                                totalCount += 1;
                                realDestPath = utils_1.getRealDestPath(fileFullPath, source, dest, saveMode);
                                if (isDelete) {
                                    // 删除硬链接
                                    try {
                                        linkPaths = utils_1.getLinkPath(fileFullPath, dest, deleteDir);
                                        linkPaths.forEach(function (removePath) {
                                            execa_1.default.sync('rm', ['-r', removePath]);
                                            var deletePathMessage = chalk_1.default.cyan(utils_1.getDirBasePath(dest, removePath));
                                            utils_1.log.info((deleteDir ? '目录' : '硬链') + " " + deletePathMessage + " \u5DF2\u5220\u9664");
                                        });
                                    }
                                    catch (e) {
                                        if (e.message === 'ALREADY_DELETE') {
                                            utils_1.log.warn("\u76EE\u5F55 " + chalk_1.default.cyan(utils_1.getDirBasePath(dest, realDestPath)) + " \u5DF2\u5220\u9664");
                                        }
                                    }
                                }
                                else {
                                    sourceNameForMessage = chalk_1.default.yellow(utils_1.getDirBasePath(source, fileFullPath));
                                    destNameForMessage = chalk_1.default.cyan(utils_1.getDirBasePath(dest, path_1.default.join(realDestPath, name)));
                                    try {
                                        if (utils_1.checkLinkExist(fileFullPath, dest)) {
                                            throw new HlinkError_1.default('File exists');
                                        }
                                        else {
                                            fs_extra_1.default.ensureDirSync(realDestPath);
                                        }
                                        execa_1.default.sync('ln', [fileFullPath, realDestPath]);
                                        utils_1.log.success('源地址', sourceNameForMessage, '硬链成功, 硬链地址为', destNameForMessage);
                                        successCount += 1;
                                    }
                                    catch (e) {
                                        if (!e.stderr || e.stderr.indexOf('File exists') === -1) {
                                            utils_1.log.error(e);
                                            failCount += 1;
                                        }
                                        else {
                                            utils_1.log.warn('源地址', sourceNameForMessage, '硬链已存在, 跳过创建');
                                            jumpCount += 1;
                                        }
                                    }
                                }
                            }
                            else {
                                totalCount += 1;
                                utils_1.log.warn('当前文件', chalk_1.default.yellow(name), '不满足配置条件, 跳过创建');
                                jumpCount += 1;
                            }
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        }
        var deleteDir, isSecondDir, _a, source, saveMode, dest, isDelete, maxFindLevel, exts, excludeExts, sourceDir, isWhiteList, successCount, jumpCount, failCount, totalCount;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    deleteDir = false;
                    isSecondDir = false;
                    return [4 /*yield*/, parse_1.default(input, options)];
                case 1:
                    _a = _b.sent(), source = _a.source, saveMode = _a.saveMode, dest = _a.dest, isDelete = _a.isDelete, maxFindLevel = _a.maxFindLevel, exts = _a.exts, excludeExts = _a.excludeExts, sourceDir = _a.sourceDir;
                    isWhiteList = !!exts.length;
                    utils_1.startLog({
                        extname: isWhiteList ? exts : excludeExts,
                        maxLevel: maxFindLevel,
                        saveMode: saveMode
                    }, isWhiteList, isDelete);
                    successCount = 0;
                    jumpCount = 0;
                    failCount = 0;
                    totalCount = 0;
                    start(source);
                    utils_1.endLog(successCount, failCount, jumpCount, totalCount);
                    saveRecord_1.default(sourceDir, dest, isDelete && !isSecondDir);
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = hardLink;
