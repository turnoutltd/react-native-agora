import { Component } from "react";
import { ViewProps } from "react-native";
import { VideoMirrorMode, VideoRenderMode } from "./Types";
/**
 * Properties of the uid.
 * @property uid: int | User ID.
 */
interface RtcUidProps {
    uid: number;
}
/**
 * Properties of the SurfaceView.
 * @property zOrderMediaOverlay: boolean | Control whether the surface view's surface is placed on top of another regular surface view in the window (but still behind the window itself).
 * @property zOrderOnTop: boolean | Control whether the surface view's surface is placed on top of its window.
 * @property renderMode: number | The rendering mode of the video view.
 * @see VideoRenderMode
 * @property channelId: string | The unique channel name for the AgoraRTC session in the string format. The string length must be less than 64 bytes. Supported character scopes are:
 * - All lowercase English letters: a to z.
 * - All uppercase English letters: A to Z.
 * - All numeric characters: 0 to 9.
 * - The space character.
 * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
 * Note
 * - The default value is the empty string "". Use the default value if the user joins the channel using the joinChannel method in the RtcEngine class.
 * @see RtcEngine.joinChannel
 * - If the user joins the channel using the joinChannel method in the RtcChannel class, set this parameter as the channelId of the RtcChannel object.
 * @see RtcChannel.joinChannel
 * @property mirrorMode: number | The video mirror mode.
 * @see VideoMirrorMode
 */
interface RtcSurfaceViewProps extends ViewProps {
    zOrderMediaOverlay?: boolean;
    zOrderOnTop?: boolean;
    renderMode?: VideoRenderMode;
    channelId?: string;
    mirrorMode?: VideoMirrorMode;
}
/**
 * Properties of the TextureView.
 * @property mirror: boolean | The video mirror.
 */
interface RtcTextureViewProps extends ViewProps {
    mirror?: boolean;
}
/**
 * View for preview local video.
 */
export declare namespace RtcLocalView {
    /**
     * Use SurfaceView in Android.
     * Use UIView in iOS.
     */
    class SurfaceView extends Component<RtcSurfaceViewProps, {}> {
        render(): JSX.Element;
    }
    /**
     * Use TextureView in Android.
     * Not support for iOS.
     */
    class TextureView extends Component<RtcTextureViewProps, {}> {
        render(): JSX.Element;
    }
}
/**
 * View for render remote video.
 */
export declare namespace RtcRemoteView {
    /**
     * Use SurfaceView in Android.
     * Use UIView in iOS.
     */
    class SurfaceView extends Component<RtcSurfaceViewProps & RtcUidProps, {}> {
        render(): JSX.Element;
    }
    /**
     * Use TextureView in Android.
     * Not support for iOS.
     */
    class TextureView extends Component<RtcTextureViewProps & RtcUidProps, {}> {
        render(): JSX.Element;
    }
}
export {};
