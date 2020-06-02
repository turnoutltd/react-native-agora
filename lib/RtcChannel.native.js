"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const { AgoraRtcChannelModule } = react_native_1.NativeModules;
const Prefix = AgoraRtcChannelModule.prefix;
const RtcChannelEvent = new react_native_1.NativeEventEmitter(AgoraRtcChannelModule);
const channels = new Map();
/**
 * The RtcChannel class.
 */
class RtcChannel {
    constructor(channelId) {
        this._listeners = new Map();
        this._channelId = channelId;
    }
    /**
     * Creates and gets an RtcChannel instance.
     * @see RtcChannel
     * To join more than one channel, call this method multiple times to create as many RtcChannel instances as needed, and call the joinChannel method of each created RtcChannel object.
     * @see RtcChannel.joinChannel
     * After joining multiple channels, you can simultaneously subscribe to streams of all the channels, but publish a stream in only one channel at one time.
     * @param channelId The unique channel name for the AgoraRTC session in the string format. The string length must be less than 64 bytes. This parameter does not have a default value. You must set it. Do not set it as the empty string "". Otherwise, the SDK returns Refused(-5). Supported character scopes are:
     * @see ErrorCode.Refused
     * - All lowercase English letters: a to z.
     * - All uppercase English letters: A to Z.
     * - All numeric characters: 0 to 9.
     * - The space character.
     * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     */
    static async create(channelId) {
        if (channels.get(channelId))
            return channels.get(channelId);
        await AgoraRtcChannelModule.create(channelId);
        channels.set(channelId, new RtcChannel(channelId));
        return channels.get(channelId);
    }
    static destroyAll() {
        channels.forEach(async (value, key) => {
            await value.destroy();
        });
        channels.clear();
    }
    /**
     * Destroys the RtcChannel instance.
     * @see RtcChannel
     */
    destroy() {
        this.removeAllListeners();
        channels.delete(this._channelId);
        return AgoraRtcChannelModule.destroy(this._channelId);
    }
    /**
     * Adds the channel event handler.
     * After setting the channel event handler, you can listen for channel events and receive the statistics of the corresponding RtcChannel instance.
     * @param event The event type.
     * @param listener The event handler.
     */
    addListener(event, listener) {
        const callback = (res) => {
            const { channelId, data } = res;
            if (channelId === this._channelId) {
                // @ts-ignore
                listener(...data);
            }
        };
        let map = this._listeners.get(event);
        if (map === undefined) {
            map = new Map();
            this._listeners.set(event, map);
        }
        RtcChannelEvent.addListener(Prefix + event, callback);
        map.set(listener, callback);
        return {
            remove: () => {
                this.removeListener(event, listener);
            }
        };
    }
    /**
     * Removes the channel event handler.
     * For callback events that you only want to listen for once, call this method to remove it after you have received them.
     * @param event The event type.
     * @param listener The event handler.
     */
    removeListener(event, listener) {
        const map = this._listeners.get(event);
        if (map === undefined)
            return;
        RtcChannelEvent.removeListener(Prefix + event, map.get(listener));
        map.delete(listener);
    }
    /**
     * Removes all of the engine event handlers.
     * @param event The event type.
     */
    removeAllListeners(event) {
        if (event === undefined) {
            this._listeners.forEach((value, key) => {
                RtcChannelEvent.removeAllListeners(Prefix + key);
            });
            this._listeners.clear();
            return;
        }
        RtcChannelEvent.removeAllListeners(Prefix + event);
        this._listeners.delete(event);
    }
    /**
     * Sets the role of a user.
     * This method sets the role of a user, such as a host or an audience. In a Live-Broadcast channel, only a broadcaster can call the publish method in the RtcChannel class.
     * @see RtcChannel.publish
     * A successful call of this method triggers the following callbacks:
     * - The local client: onClientRoleChanged.
     * @see RtcChannelEvents.ClientRoleChanged
     * - The remote client: onUserJoined or onUserOffline(BecomeAudience).
     * @see RtcChannelEvents.UserJoined
     * @see RtcChannelEvents.UserOffline
     * @see UserOfflineReason.BecomeAudience
     * @param role The role of the user.
     * @see ClientRole
     */
    setClientRole(role) {
        return AgoraRtcChannelModule.setClientRole(this._channelId, role);
    }
    /**
     * Joins the channel with a user ID.
     * Note
     * - If you are already in a channel, you cannot rejoin it with the same uid.
     * - We recommend using different UIDs for different channels.
     * - If you want to join the same channel from different devices, ensure that the UIDs in all devices are different.
     * - Ensure that the app ID you use to generate the token is the same with the app ID used when creating the RtcEngine instance.
     * @see RtcEngine
     * @param token The token generated at your server.
     * - In situations not requiring high security: You can use the temporary token generated at Console. For details, see Get a temporary token.
     * - In situations requiring high security: Set it as the token generated at your server. For details, see Generate a token.
     * @param optionalInfo Additional information about the channel. This parameter can be set as null. Other users in the channel do not receive this information.
     * @param optionalUid The user ID. A 32-bit unsigned integer with a value ranging from 1 to (232-1). This parameter must be unique. If uid is not assigned (or set as 0), the SDK assigns a uid and reports it in the onJoinChannelSuccess callback. The app must maintain this user ID.
     * @param options The channel media options.
     * @see ChannelMediaOptions
     */
    joinChannel(token, optionalInfo, optionalUid, options) {
        return AgoraRtcChannelModule.joinChannel(this._channelId, token, optionalInfo, optionalUid, options);
    }
    /**
     * Joins a channel with the user account.
     * Note
     * - If you are already in a channel, you cannot rejoin it with the same uid.
     * - We recommend using different user accounts for different channels.
     * - If you want to join the same channel from different devices, ensure that the user accounts in all devices are different.
     * - Ensure that the app ID you use to generate the token is the same with the app ID used when creating the RtcEngine instance.
     * @see RtcEngine
     * @param token The token generated at your server.
     * - In situations not requiring high security: You can use the temporary token generated at Console. For details, see Get a temporary token.
     * - In situations requiring high security: Set it as the token generated at your server. For details, see Generate a token.
     * @param userAccount The user account. The maximum length of this parameter is 255 bytes. Ensure that you set this parameter and do not set it as null.
     * - All lowercase English letters: a to z.
     * - All uppercase English letters: A to Z.
     * - All numeric characters: 0 to 9.
     * - The space character.
     * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     * @param options The channel media options.
     * @see ChannelMediaOptions
     */
    joinChannelWithUserAccount(token, userAccount, options) {
        return AgoraRtcChannelModule.joinChannelWithUserAccount(this._channelId, token, userAccount, options);
    }
    /**
     * Leaves the current channel.
     * A successful leaveChannel method call triggers the following callbacks:
     * - The local client: onLeaveChannel.
     * @see RtcChannelEvents.LeaveChannel
     * - The remote client: onUserOffline, if the user leaving the channel is in a Communication channel, or is a broadcaster in a Live-Broadcast channel.
     * @see RtcChannelEvents.UserOffline
     */
    leaveChannel() {
        return AgoraRtcChannelModule.leaveChannel(this._channelId);
    }
    /**
     * Renews the token when the current token expires.
     * In the following situations, the SDK decides that the current token has expired:
     * - The SDK triggers the onTokenPrivilegeWillExpire callback, or
     * @see RtcChannelEvents.TokenPrivilegeWillExpire
     * - The onConnectionStateChanged callback reports the TokenExpired(9) error.
     * @see RtcChannelEvents.ConnectionStateChanged
     * @see ConnectionChangedReason.TokenExpired
     * You should get a new token from your server and call this method to renew it. Failure to do so results in the SDK disconnecting from the Agora server.
     * @param token The new token.
     */
    renewToken(token) {
        return AgoraRtcChannelModule.renewToken(this._channelId, token);
    }
    /**
     * Gets the connection state of the SDK.
     */
    getConnectionState() {
        return AgoraRtcChannelModule.getConnectionState(this._channelId);
    }
    /**
     * Publishes the local stream to the channel.
     * You must keep the following restrictions in mind when calling this method. Otherwise, the SDK returns the Refused(-5)：
     * @see ErrorCode.Refused
     * - This method publishes one stream only to the channel corresponding to the current RtcChannel instance.
     * - In a Live-Broadcast channel, only a broadcaster can call this method. To switch the client role, call setClientRole of the current RtcChannel instance.
     * @see RtcChannel.setClientRole
     * - You can publish a stream to only one channel at a time. For details, see the advanced guide Join Multiple Channels.
     */
    publish() {
        return AgoraRtcChannelModule.publish(this._channelId);
    }
    /**
     * Stops publishing a stream to the channel.
     * If you call this method in a channel where you are not publishing streams, the SDK returns Refused(-5).
     * @see ErrorCode.Refused
     */
    unpublish() {
        return AgoraRtcChannelModule.unpublish(this._channelId);
    }
    /**
     * Gets the current call ID.
     */
    getCallId() {
        return AgoraRtcChannelModule.getCallId(this._channelId);
    }
    adjustUserPlaybackSignalVolume(uid, volume) {
        return AgoraRtcChannelModule.adjustUserPlaybackSignalVolume(this._channelId, uid, volume);
    }
    muteRemoteAudioStream(uid, muted) {
        return AgoraRtcChannelModule.muteRemoteAudioStream(this._channelId, uid, muted);
    }
    muteAllRemoteAudioStreams(muted) {
        return AgoraRtcChannelModule.muteAllRemoteAudioStreams(this._channelId, muted);
    }
    setDefaultMuteAllRemoteAudioStreams(muted) {
        return AgoraRtcChannelModule.setDefaultMuteAllRemoteAudioStreams(this._channelId, muted);
    }
    muteAllRemoteVideoStreams(muted) {
        return AgoraRtcChannelModule.muteAllRemoteVideoStreams(this._channelId, muted);
    }
    muteRemoteVideoStream(uid, muted) {
        return AgoraRtcChannelModule.muteRemoteVideoStream(this._channelId, uid, muted);
    }
    setDefaultMuteAllRemoteVideoStreams(muted) {
        return AgoraRtcChannelModule.setDefaultMuteAllRemoteVideoStreams(this._channelId, muted);
    }
    setRemoteVoicePosition(uid, pan, gain) {
        return AgoraRtcChannelModule.setRemoteVoicePosition(this._channelId, uid, pan, gain);
    }
    addPublishStreamUrl(url, transcodingEnabled) {
        return AgoraRtcChannelModule.addPublishStreamUrl(this._channelId, url, transcodingEnabled);
    }
    removePublishStreamUrl(url) {
        return AgoraRtcChannelModule.removePublishStreamUrl(this._channelId, url);
    }
    setLiveTranscoding(transcoding) {
        return AgoraRtcChannelModule.setLiveTranscoding(this._channelId, transcoding);
    }
    startChannelMediaRelay(channelMediaRelayConfiguration) {
        return AgoraRtcChannelModule.startChannelMediaRelay(this._channelId, channelMediaRelayConfiguration);
    }
    stopChannelMediaRelay() {
        return AgoraRtcChannelModule.stopChannelMediaRelay(this._channelId);
    }
    updateChannelMediaRelay(channelMediaRelayConfiguration) {
        return AgoraRtcChannelModule.updateChannelMediaRelay(this._channelId, channelMediaRelayConfiguration);
    }
    setRemoteDefaultVideoStreamType(streamType) {
        return AgoraRtcChannelModule.setRemoteDefaultVideoStreamType(this._channelId, streamType);
    }
    setRemoteVideoStreamType(uid, streamType) {
        return AgoraRtcChannelModule.setRemoteVideoStreamType(this._channelId, uid, streamType);
    }
    setRemoteUserPriority(uid, userPriority) {
        return AgoraRtcChannelModule.setRemoteUserPriority(this._channelId, uid, userPriority);
    }
    registerMediaMetadataObserver() {
        return AgoraRtcChannelModule.registerMediaMetadataObserver(this._channelId);
    }
    sendMetadata(metadata) {
        return AgoraRtcChannelModule.sendMetadata(this._channelId, metadata);
    }
    setMaxMetadataSize(size) {
        return AgoraRtcChannelModule.setMaxMetadataSize(this._channelId, size);
    }
    unregisterMediaMetadataObserver() {
        return AgoraRtcChannelModule.unregisterMediaMetadataObserver(this._channelId);
    }
    setEncryptionMode(encryptionMode) {
        return AgoraRtcChannelModule.setEncryptionMode(this._channelId, encryptionMode);
    }
    setEncryptionSecret(secret) {
        return AgoraRtcChannelModule.setEncryptionSecret(this._channelId, secret);
    }
    addInjectStreamUrl(url, config) {
        return AgoraRtcChannelModule.addInjectStreamUrl(this._channelId, url, config);
    }
    removeInjectStreamUrl(url) {
        return AgoraRtcChannelModule.removeInjectStreamUrl(this._channelId, url);
    }
    createDataStream(reliable, ordered) {
        return AgoraRtcChannelModule.createDataStream(this._channelId, reliable, ordered);
    }
    sendStreamMessage(streamId, message) {
        return AgoraRtcChannelModule.sendStreamMessage(this._channelId, streamId, message);
    }
}
exports.default = RtcChannel;
//# sourceMappingURL=RtcChannel.native.js.map