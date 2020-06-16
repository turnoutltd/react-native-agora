import React, { Component } from "react";
import { Platform, requireNativeComponent } from "react-native";
const RCTRtcSurfaceView = requireNativeComponent('RCTAgoraRtcSurfaceView');
class RtcSurfaceView extends Component {
    render() {
        return (React.createElement(RCTRtcSurfaceView, Object.assign({}, this.props)));
    }
}
const RCTRtcTextureView = requireNativeComponent('RCTAgoraRtcTextureView');
class RtcTextureView extends Component {
    render() {
        return (React.createElement(RCTRtcTextureView, Object.assign({}, this.props)));
    }
}
/**
 * View for preview local video.
 */
export var RtcLocalView;
(function (RtcLocalView) {
    /**
     * Use SurfaceView in Android.
     * Use UIView in iOS.
     */
    class SurfaceView extends Component {
        render() {
            return (React.createElement(RtcSurfaceView, Object.assign({}, this.props, { uid: 0 })));
        }
    }
    RtcLocalView.SurfaceView = SurfaceView;
    /**
     * Use TextureView in Android.
     * Not support for iOS.
     */
    class TextureView extends Component {
        render() {
            if (Platform.OS === 'ios')
                throw new Error('TextureView not support for iOS');
            return (React.createElement(RtcTextureView, Object.assign({}, this.props, { uid: 0 })));
        }
    }
    RtcLocalView.TextureView = TextureView;
})(RtcLocalView || (RtcLocalView = {}));
/**
 * View for render remote video.
 */
export var RtcRemoteView;
(function (RtcRemoteView) {
    /**
     * Use SurfaceView in Android.
     * Use UIView in iOS.
     */
    class SurfaceView extends Component {
        render() {
            return (React.createElement(RtcSurfaceView, Object.assign({}, this.props)));
        }
    }
    RtcRemoteView.SurfaceView = SurfaceView;
    /**
     * Use TextureView in Android.
     * Not support for iOS.
     */
    class TextureView extends Component {
        render() {
            if (Platform.OS === 'ios')
                throw new Error('TextureView not support for iOS');
            return (React.createElement(RtcTextureView, Object.assign({}, this.props)));
        }
    }
    RtcRemoteView.TextureView = TextureView;
})(RtcRemoteView || (RtcRemoteView = {}));
//# sourceMappingURL=RtcRenderView.native.js.map