"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Types = exports.RtcRemoteView = exports.RtcLocalView = exports.RtcChannel = void 0;
const tslib_1 = require("tslib");
const RtcEngine_native_1 = tslib_1.__importDefault(require("./RtcEngine.native"));
const RtcChannel_native_1 = tslib_1.__importDefault(require("./RtcChannel.native"));
exports.RtcChannel = RtcChannel_native_1.default;
const RtcRenderView_native_1 = require("./RtcRenderView.native");
Object.defineProperty(exports, "RtcLocalView", { enumerable: true, get: function () { return RtcRenderView_native_1.RtcLocalView; } });
Object.defineProperty(exports, "RtcRemoteView", { enumerable: true, get: function () { return RtcRenderView_native_1.RtcRemoteView; } });
const Types = tslib_1.__importStar(require("./Types"));
exports.Types = Types;
exports.default = RtcEngine_native_1.default;
//# sourceMappingURL=index.js.map