"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtcRemoteView = exports.RtcLocalView = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_native_1 = require("react-native");
const RCTRtcSurfaceView = react_native_1.requireNativeComponent('RCTAgoraRtcSurfaceView');
class RtcSurfaceView extends react_1.Component {
    render() {
        return (react_1.default.createElement(RCTRtcSurfaceView, Object.assign({}, this.props)));
    }
}
const RCTRtcTextureView = react_native_1.requireNativeComponent('RCTAgoraRtcTextureView');
class RtcTextureView extends react_1.Component {
    render() {
        return (react_1.default.createElement(RCTRtcTextureView, Object.assign({}, this.props)));
    }
}
/**
 * View for preview local video.
 */
var RtcLocalView;
(function (RtcLocalView) {
    /**
     * Use SurfaceView in Android.
     * Use UIView in iOS.
     */
    class SurfaceView extends react_1.Component {
        render() {
            return (react_1.default.createElement(RtcSurfaceView, Object.assign({}, this.props, { uid: 0 })));
        }
    }
    RtcLocalView.SurfaceView = SurfaceView;
    /**
     * Use TextureView in Android.
     * Not support for iOS.
     */
    class TextureView extends react_1.Component {
        render() {
            if (react_native_1.Platform.OS === 'ios')
                throw new Error('TextureView not support for iOS');
            return (react_1.default.createElement(RtcTextureView, Object.assign({}, this.props, { uid: 0 })));
        }
    }
    RtcLocalView.TextureView = TextureView;
})(RtcLocalView = exports.RtcLocalView || (exports.RtcLocalView = {}));
/**
 * View for render remote video.
 */
var RtcRemoteView;
(function (RtcRemoteView) {
    /**
     * Use SurfaceView in Android.
     * Use UIView in iOS.
     */
    class SurfaceView extends react_1.Component {
        render() {
            return (react_1.default.createElement(RtcSurfaceView, Object.assign({}, this.props)));
        }
    }
    RtcRemoteView.SurfaceView = SurfaceView;
    /**
     * Use TextureView in Android.
     * Not support for iOS.
     */
    class TextureView extends react_1.Component {
        render() {
            if (react_native_1.Platform.OS === 'ios')
                throw new Error('TextureView not support for iOS');
            return (react_1.default.createElement(RtcTextureView, Object.assign({}, this.props)));
        }
    }
    RtcRemoteView.TextureView = TextureView;
})(RtcRemoteView = exports.RtcRemoteView || (exports.RtcRemoteView = {}));
//# sourceMappingURL=RtcRenderView.native.js.map