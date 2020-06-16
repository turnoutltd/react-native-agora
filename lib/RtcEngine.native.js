import { NativeEventEmitter, NativeModules } from "react-native";
import { IPAreaCode } from "./Types";
import RtcChannel from "./RtcChannel.native";
const { AgoraRtcEngineModule } = NativeModules;
const Prefix = AgoraRtcEngineModule.prefix;
const RtcEngineEvent = new NativeEventEmitter(AgoraRtcEngineModule);
let engine;
/**
 * RtcEngine is the main class of the Agora SDK.
 */
export default class RtcEngine {
    constructor() {
        this._listeners = new Map();
    }
    static instance() {
        if (engine) {
            return engine;
        }
        else {
            throw new Error('please create RtcEngine first');
        }
    }
    /**
     * Creates an RtcEngine instance.
     * @see RtcEngine
     * Unless otherwise specified, all the methods provided by the RtcEngine class are executed asynchronously. Agora recommends calling these methods in the same thread.
     * Note
     * - You must create an RtcEngine instance before calling any other method.
     * - You can create an RtcEngine instance either by calling this method or by calling create2. The difference between create2 and this method is that create2 enables you to specify the connection area.
     * @see RtcEngine#createWithAreaCode
     * - The Agora RTC Native SDK supports creating only one RtcEngine instance for an app for now.
     * @param appId The App ID issued to you by Agora. See How to get the App ID. Only users in apps with the same App ID can join the same channel and communicate with each other. Use an App ID to create only one RtcEngine instance. To change your App ID, call destroy to destroy the current RtcEngine instance, and after destroy returns 0, call create to create an RtcEngine instance with the new App ID.
     */
    static async create(appId) {
        return RtcEngine.createWithAreaCode(appId, IPAreaCode.AREA_GLOBAL);
    }
    /**
     * Creates an RtcEngine instance.
     * @see RtcEngine
     * Unless otherwise specified, all the methods provided by the RtcEngine class are executed asynchronously. Agora recommends calling these methods in the same thread.
     * Note
     * - You must create an RtcEngine instance before calling any other method.
     * - You can create an RtcEngine instance either by calling this method or by calling create1. The difference between create1 and this method is that this method enables you to specify the connection area.
     * @see RtcEngine#create
     * - The Agora RTC Native SDK supports creating only one RtcEngine instance for an app for now.
     * @param appId The App ID issued to you by Agora. See How to get the App ID. Only users in apps with the same App ID can join the same channel and communicate with each other. Use an App ID to create only one RtcEngine instance. To change your App ID, call destroy to destroy the current RtcEngine instance and after destroy returns 0, call create to create an RtcEngine instance with the new App ID.
     * @param areaCode The area of connection. This advanced feature applies to scenarios that have regional restrictions.
     * You can use the bitwise OR operator (|) to specify multiple areas. For details, see IPAreaCode.
     * @see IPAreaCode
     * After specifying the area of connection:
     * - When the app that integrates the Agora SDK is used within the specified area, it connects to the Agora servers within the specified area under normal circumstances.
     * - When the app that integrates the Agora SDK is used out of the specified area, it connects to the Agora servers either in the specified area or in the area where the app is located.
     */
    static async createWithAreaCode(appId, areaCode) {
        if (engine)
            return engine;
        await AgoraRtcEngineModule.create(appId, areaCode);
        engine = new RtcEngine();
        return engine;
    }
    /**
     * Destroys the RtcEngine instance and releases all resources used by the Agora SDK.
     * @see RtcEngine
     * This method is useful for apps that occasionally make voice or video calls, to free up resources for other operations when not making calls.
     * Note
     * - Call this method in the subthread.
     * - Once the app calls destroy to destroy the created RtcEngine instance, you cannot use any method or callback in the SDK.
     */
    destroy() {
        RtcChannel.destroyAll();
        this.removeAllListeners();
        engine = undefined;
        return AgoraRtcEngineModule.destroy();
    }
    /**
     * Adds the engine event handler.
     * After setting the engine event handler, you can listen for engine events and receive the statistics of the corresponding RtcEngine instance.
     * @param event The event type.
     * @param listener The event handler.
     */
    addListener(event, listener) {
        const callback = (res) => {
            const { channelId, data } = res;
            if (channelId === undefined) {
                // @ts-ignore
                listener(...data);
            }
        };
        let map = this._listeners.get(event);
        if (map === undefined) {
            map = new Map();
            this._listeners.set(event, map);
        }
        RtcEngineEvent.addListener(Prefix + event, callback);
        map.set(listener, callback);
        return {
            remove: () => {
                this.removeListener(event, listener);
            }
        };
    }
    /**
     * Removes the engine event handler.
     * For callback events that you only want to listen for once, call this method to remove it after you have received them.
     * @param event The event type.
     * @param listener The event handler.
     */
    removeListener(event, listener) {
        const map = this._listeners.get(event);
        if (map === undefined)
            return;
        RtcEngineEvent.removeListener(Prefix + event, map.get(listener));
        map.delete(listener);
    }
    /**
     * Removes all of the engine event handlers.
     * @param event The event type.
     */
    removeAllListeners(event) {
        if (event === undefined) {
            this._listeners.forEach((value, key) => {
                RtcEngineEvent.removeAllListeners(Prefix + key);
            });
            this._listeners.clear();
            return;
        }
        RtcEngineEvent.removeAllListeners(Prefix + event);
        this._listeners.delete(event);
    }
    /**
     * Sets the channel profile of the Agora RtcEngine.
     * The Agora RtcEngine differentiates channel profiles and applies different optimization algorithms accordingly. For example, it prioritizes smoothness and low latency for a video call, and prioritizes video quality for a video broadcast.
     * @param profile The channel profile of the Agora RtcEngine.
     * @see ChannelProfile
     */
    setChannelProfile(profile) {
        return AgoraRtcEngineModule.setChannelProfile(profile);
    }
    /**
     * Sets the role of a user (Live Broadcast only).
     * This method sets the role of a user, such as a host or an audience (default), before joining a channel.
     * This method can be used to switch the user role after a user joins a channel. In the Live Broadcast profile, when a user switches user roles after joining a channel, a successful setClientRole method call triggers the following callbacks:
     * - The local client: onClientRoleChanged.
     * @see RtcEngineEvents.ClientRoleChanged
     * - The remote client: onUserJoined or onUserOffline(BecomeAudience).
     * @see RtcEngineEvents.UserJoined
     * @see RtcEngineEvents.UserOffline
     * @see UserOfflineReason.BecomeAudience
     * @param role Sets the role of a user.
     * @see ClientRole
     */
    setClientRole(role) {
        return AgoraRtcEngineModule.setClientRole(role);
    }
    /**
     * Allows a user to join a channel.
     * Users in the same channel can talk to each other, and multiple users in the same channel can start a group chat. Users with different App IDs cannot call each other.
     * You must call the leaveChannel method to exit the current call before joining another channel.
     * @see RtcEngine.leaveChannel
     * A successful joinChannel method call triggers the following callbacks:
     * - The local client: onJoinChannelSuccess.
     * @see RtcEngineEvents.JoinChannelSuccess
     * - The remote client: onUserJoined, if the user joining the channel is in the Communication profile, or is a BROADCASTER in the Live Broadcast profile.
     * @see RtcEngineEvents.UserJoined
     * @see ChannelProfile.Communication
     * @see ClientRole.Broadcaster
     * @see ChannelProfile.LiveBroadcasting
     * When the connection between the client and Agora's server is interrupted due to poor network conditions, the SDK tries reconnecting to the server. When the local client successfully rejoins the channel, the SDK triggers the onRejoinChannelSuccess callback on the local client.
     * @see RtcEngineEvents.RejoinChannelSuccess
     * The uid is represented as a 32-bit unsigned integer in the SDK. Since unsigned integers are not supported by Java, the uid is handled as a 32-bit signed integer and larger numbers are interpreted as negative numbers in Java. If necessary, the uid can be converted to a 64-bit integer through “uid&0xffffffffL”.
     * Note
     * - A channel does not accept duplicate uids, such as two users with the same uid. If you set uid as 0, the system automatically assigns a uid.
     * Warning
     * - Ensure that the App ID used for creating the token is the same App ID used in the create method for creating an RtcEngine object. Otherwise, CDN live streaming may fail.
     * @param token The token for authentication:
     * - In situations not requiring high security: You can use the temporary token generated at Console. For details, see Get a temporary token.
     * - In situations requiring high security: Set it as the token generated at your server. For details, see Generate a token.
     * @param channelName The unique channel name for the AgoraRTC session in the string format. The string length must be less than 64 bytes. Supported character scopes are:
     * - All lowercase English letters: a to z.
     * - All uppercase English letters: A to Z.
     * - All numeric characters: 0 to 9.
     * - The space character.
     * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     * @param optionalInfo Additional information about the channel. This parameter can be set as null or contain channel related information. Other users in the channel do not receive this message.
     * @param optionalUid (Optional) User ID. A 32-bit unsigned integer with a value ranging from 1 to (2^32-1). optionalUid must be unique. If optionalUid is not assigned (or set to 0), the SDK assigns and returns uid in the onJoinChannelSuccess callback. Your app must record and maintain the returned uid since the SDK does not do so.
     * @see RtcEngineEvents.JoinChannelSuccess
     */
    joinChannel(token, channelName, optionalInfo, optionalUid) {
        return AgoraRtcEngineModule.joinChannel(token, channelName, optionalInfo, optionalUid);
    }
    /**
     * Switches to a different channel.
     * This method allows the audience of a Live-broadcast channel to switch to a different channel.
     * After the user successfully switches to another channel, the onLeaveChannel and onJoinChannelSuccess callbacks are triggered to indicate that the user has left the original channel and joined a new one.
     * @see RtcEngineEvents.LeaveChannel
     * @see RtcEngineEvents.JoinChannelSuccess
     * Note
     * - This method applies to the audience role in a Live-broadcast channel only.
     * @see ClientRole.Audience
     * @see ChannelProfile.LiveBroadcasting
     * @param token The token for authentication:
     * - In situations not requiring high security: You can use the temporary token generated at Console. For details, see Get a temporary token.
     * - In situations requiring high security: Set it as the token generated at your server. For details, see Generate a token.
     * @param channelName Unique channel name for the AgoraRTC session in the string format. The string length must be less than 64 bytes. Supported character scopes are:
     * - All lowercase English letters: a to z.
     * - All uppercase English letters: A to Z.
     * - All numeric characters: 0 to 9.
     * - The space character.
     * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     */
    switchChannel(token, channelName) {
        return AgoraRtcEngineModule.switchChannel(token, channelName);
    }
    /**
     * Allows a user to leave a channel.
     * After joining a channel, the user must call the leaveChannel method to end the call before joining another channel. This method returns 0 if the user leaves the channel and releases all resources related to the call. This method call is asynchronous, and the user has not exited the channel when the method call returns. Once the user leaves the channel, the SDK triggers the onLeaveChannel callback.
     * A successful leaveChannel method call triggers the following callbacks:
     * - The local client: onLeaveChannel.
     * @see RtcEngineEvents.LeaveChannel
     * - The remote client: onUserOffline, if the user leaving the channel is in the Communication channel, or is a BROADCASTER in the Live Broadcast profile.
     * @see RtcEngineEvents.UserOffline
     * @see ChannelProfile.Communication
     * @see ClientRole.Broadcaster
     * @see ChannelProfile.LiveBroadcasting
     * Note
     * - If you call the destroy method immediately after calling the leaveChannel method, the leaveChannel process interrupts, and the SDK does not trigger the onLeaveChannel callback.
     * @see RtcEngine.destroy
     * - If you call the leaveChannel method during CDN live streaming, the SDK triggers the removeInjectStreamUrl method.
     * @see RtcEngine.removeInjectStreamUrl
     */
    leaveChannel() {
        return AgoraRtcEngineModule.leaveChannel();
    }
    /**
     * Renews the token when the current token expires.
     * The token expires after a period of time once the token schema is enabled when:
     * - The SDK triggers the onTokenPrivilegeWillExpire callback, or
     * @see RtcEngineEvents.TokenPrivilegeWillExpire
     * - The onConnectionStateChanged callback reports the TokenExpired(9) error.
     * @see RtcEngineEvents.ConnectionStateChanged
     * @see ConnectionChangedReason.TokenExpired
     * The app should retrieve a new token from the server and call this method to renew it. Failure to do so results in the SDK disconnecting from the server.
     * @param token The new token.
     */
    renewToken(token) {
        return AgoraRtcEngineModule.renewToken(token);
    }
    /**
     * Enables interoperability with the Agora Web SDK (Live Broadcast only).
     * @deprecated As of v3.0.0, the Native SDK automatically enables interoperability with the Web SDK, so you no longer need to call this method.
     * If the channel has Web SDK users, ensure that you call this method, or the video of the Native user will be a black screen for the Web user.
     * Use this method when the channel profile is Live Broadcast. Interoperability with the Agora Web SDK is enabled by default when the channel profile is Communication.
     * @param enabled Sets whether to enable/disable interoperability with the Agora Web SDK:
     * - true: Enable.
     * - false: (Default) Disable.
     */
    enableWebSdkInteroperability(enabled) {
        return AgoraRtcEngineModule.enableWebSdkInteroperability(enabled);
    }
    /**
     * Gets the connection state of the SDK.
     */
    getConnectionState() {
        return AgoraRtcEngineModule.getConnectionState();
    }
    /**
     * Gets the current call ID.
     * When a user joins a channel on a client, a call ID is generated to identify the call from the client. Feedback methods, such as the rate and complain method, must be called after the call ends to submit feedback to the SDK.
     * @see RtcEngine.rate
     * @see RtcEngine.complain
     * The rate and complain methods require the callId parameter retrieved from the getCallId method during a call. callId is passed as an argument into the rate and complain methods after the call ends.
     */
    getCallId() {
        return AgoraRtcEngineModule.getCallId();
    }
    /**
     * Allows the user to rate a call after the call ends.
     * @param callId ID of the call retrieved from the getCallId method.
     * @see RtcEngine.getCallId
     * @param rating Rating of the call. The value is between 1 (lowest score) and 5 (highest score). If you set a value out of this range, the InvalidArgument(-2) error occurs.
     * @see ErrorCode.InvalidArgument
     * @param description (Optional) The description of the rating. The string length must be less than 800 bytes.
     */
    rate(callId, rating, description) {
        return AgoraRtcEngineModule.rate(callId, rating, description);
    }
    /**
     * Allows a user to complain about the call quality after a call ends.
     * @param callId ID of the call retrieved from the getCallId method.
     * @see RtcEngine.getCallId
     * @param description (Optional) The description of the complaint. The string length must be less than 800 bytes.
     */
    complain(callId, description) {
        return AgoraRtcEngineModule.complain(callId, description);
    }
    /**
     * Specifies an SDK output log file.
     * The log file records all log data for the SDK’s operation. Ensure that the directory for the log file exists and is writable.
     * Note
     * - Ensure that you call this method immediately after calling the create method, otherwise the output log may not be complete.
     * @see RtcEngine.create
     * @param filePath File path of the log file. The string of the log file is in UTF-8. The default file path is /storage/emulated/0/Android/data/<package name>="">/files/agorasdk.log.
     */
    setLogFile(filePath) {
        return AgoraRtcEngineModule.setLogFile(filePath);
    }
    /**
     * Sets the output log level of the SDK.
     * You can use one or a combination of the filters. The log level follows the sequence of OFF, CRITICAL, ERROR, WARNING, INFO, and DEBUG. Choose a level to see the logs preceding that level. For example, if you set the log level to WARNING, you see the logs within levels CRITICAL, ERROR, and WARNING.
     * @param filter Sets the log filter level.
     * @see LogFilter
     */
    setLogFilter(filter) {
        return AgoraRtcEngineModule.setLogFilter(filter);
    }
    /**
     * Sets the log file size (KB).
     * The Agora SDK has two log files, each with a default size of 512 KB. If you set fileSizeInKBytes as 1024 KB, the SDK outputs log files with a total maximum size of 2 MB. If the total size of the log files exceed the set value, the new output log files overwrite the old output log files.
     * @param fileSizeInKBytes The SDK log file size (KB).
     */
    setLogFileSize(fileSizeInKBytes) {
        return AgoraRtcEngineModule.setLogFileSize(fileSizeInKBytes);
    }
    /**
     * Provides technical preview functionalities or special customizations by configuring the SDK with JSON options.
     * The JSON options are not public by default. Agora is working on making commonly used JSON options public in a standard way.
     * @param parameters Sets the parameter as a JSON string in the specified format.
     */
    setParameters(parameters) {
        return AgoraRtcEngineModule.setParameters(parameters);
    }
    getUserInfoByUid(uid) {
        return AgoraRtcEngineModule.getUserInfoByUid(uid);
    }
    getUserInfoByUserAccount(userAccount) {
        return AgoraRtcEngineModule.getUserInfoByUserAccount(userAccount);
    }
    joinChannelWithUserAccount(token, channelName, userAccount) {
        return AgoraRtcEngineModule.joinChannelWithUserAccount(token, channelName, userAccount);
    }
    registerLocalUserAccount(appId, userAccount) {
        return AgoraRtcEngineModule.registerLocalUserAccount(appId, userAccount);
    }
    adjustPlaybackSignalVolume(volume) {
        return AgoraRtcEngineModule.adjustPlaybackSignalVolume(volume);
    }
    adjustRecordingSignalVolume(volume) {
        return AgoraRtcEngineModule.adjustRecordingSignalVolume(volume);
    }
    adjustUserPlaybackSignalVolume(uid, volume) {
        return AgoraRtcEngineModule.adjustUserPlaybackSignalVolume(uid, volume);
    }
    disableAudio() {
        return AgoraRtcEngineModule.disableAudio();
    }
    enableAudio() {
        return AgoraRtcEngineModule.enableAudio();
    }
    enableAudioVolumeIndication(interval, smooth, report_vad) {
        return AgoraRtcEngineModule.enableAudioVolumeIndication(interval, smooth, report_vad);
    }
    enableLocalAudio(enabled) {
        return AgoraRtcEngineModule.enableLocalAudio(enabled);
    }
    muteAllRemoteAudioStreams(muted) {
        return AgoraRtcEngineModule.muteAllRemoteAudioStreams(muted);
    }
    muteLocalAudioStream(muted) {
        return AgoraRtcEngineModule.muteLocalAudioStream(muted);
    }
    muteRemoteAudioStream(uid, muted) {
        return AgoraRtcEngineModule.muteRemoteAudioStream(uid, muted);
    }
    setAudioProfile(profile, scenario) {
        return AgoraRtcEngineModule.setAudioProfile(profile, scenario);
    }
    setDefaultMuteAllRemoteAudioStreams(muted) {
        return AgoraRtcEngineModule.setDefaultMuteAllRemoteAudioStreams(muted);
    }
    disableVideo() {
        return AgoraRtcEngineModule.disableVideo();
    }
    enableLocalVideo(enabled) {
        return AgoraRtcEngineModule.enableLocalVideo(enabled);
    }
    enableVideo() {
        return AgoraRtcEngineModule.enableVideo();
    }
    muteAllRemoteVideoStreams(muted) {
        return AgoraRtcEngineModule.muteAllRemoteVideoStreams(muted);
    }
    muteLocalVideoStream(muted) {
        return AgoraRtcEngineModule.muteLocalVideoStream(muted);
    }
    muteRemoteVideoStream(uid, muted) {
        return AgoraRtcEngineModule.muteRemoteVideoStream(uid, muted);
    }
    setBeautyEffectOptions(enabled, options) {
        return AgoraRtcEngineModule.setBeautyEffectOptions(enabled, options);
    }
    setDefaultMuteAllRemoteVideoStreams(muted) {
        return AgoraRtcEngineModule.setDefaultMuteAllRemoteVideoStreams(muted);
    }
    setVideoEncoderConfiguration(config) {
        return AgoraRtcEngineModule.setVideoEncoderConfiguration(config);
    }
    adjustAudioMixingPlayoutVolume(volume) {
        return AgoraRtcEngineModule.adjustAudioMixingPlayoutVolume(volume);
    }
    adjustAudioMixingPublishVolume(volume) {
        return AgoraRtcEngineModule.adjustAudioMixingPublishVolume(volume);
    }
    adjustAudioMixingVolume(volume) {
        return AgoraRtcEngineModule.adjustAudioMixingVolume(volume);
    }
    getAudioMixingCurrentPosition() {
        return AgoraRtcEngineModule.getAudioMixingCurrentPosition();
    }
    getAudioMixingDuration() {
        return AgoraRtcEngineModule.getAudioMixingDuration();
    }
    getAudioMixingPlayoutVolume() {
        return AgoraRtcEngineModule.getAudioMixingPlayoutVolume();
    }
    getAudioMixingPublishVolume() {
        return AgoraRtcEngineModule.getAudioMixingPublishVolume();
    }
    pauseAudioMixing() {
        return AgoraRtcEngineModule.pauseAudioMixing();
    }
    resumeAudioMixing() {
        return AgoraRtcEngineModule.resumeAudioMixing();
    }
    setAudioMixingPitch(pitch) {
        return AgoraRtcEngineModule.setAudioMixingPitch(pitch);
    }
    setAudioMixingPosition(pos) {
        return AgoraRtcEngineModule.setAudioMixingPosition(pos);
    }
    startAudioMixing(filePath, loopback, replace, cycle) {
        return AgoraRtcEngineModule.startAudioMixing(filePath, loopback, replace, cycle);
    }
    stopAudioMixing() {
        return AgoraRtcEngineModule.stopAudioMixing();
    }
    getEffectsVolume() {
        return AgoraRtcEngineModule.getEffectsVolume();
    }
    pauseAllEffects() {
        return AgoraRtcEngineModule.pauseAllEffects();
    }
    pauseEffect(soundId) {
        return AgoraRtcEngineModule.pauseEffect(soundId);
    }
    playEffect(soundId, filePath, loopCount, pitch, pan, gain, publish) {
        return AgoraRtcEngineModule.playEffect(soundId, filePath, loopCount, pitch, pan, gain, publish);
    }
    preloadEffect(soundId, filePath) {
        return AgoraRtcEngineModule.preloadEffect(soundId, filePath);
    }
    resumeAllEffects() {
        return AgoraRtcEngineModule.resumeAllEffects();
    }
    resumeEffect(soundId) {
        return AgoraRtcEngineModule.resumeEffect(soundId);
    }
    setEffectsVolume(volume) {
        return AgoraRtcEngineModule.setEffectsVolume(volume);
    }
    setVolumeOfEffect(soundId, volume) {
        return AgoraRtcEngineModule.setVolumeOfEffect(soundId, volume);
    }
    stopAllEffects() {
        return AgoraRtcEngineModule.stopAllEffects();
    }
    stopEffect(soundId) {
        return AgoraRtcEngineModule.stopEffect(soundId);
    }
    unloadEffect(soundId) {
        return AgoraRtcEngineModule.unloadEffect(soundId);
    }
    setLocalVoiceChanger(voiceChanger) {
        return AgoraRtcEngineModule.setLocalVoiceChanger(voiceChanger);
    }
    setLocalVoiceEqualization(bandFrequency, bandGain) {
        return AgoraRtcEngineModule.setLocalVoiceEqualization(bandFrequency, bandGain);
    }
    setLocalVoicePitch(pitch) {
        return AgoraRtcEngineModule.setLocalVoicePitch(pitch);
    }
    setLocalVoiceReverb(reverbKey, value) {
        return AgoraRtcEngineModule.setLocalVoiceReverb(reverbKey, value);
    }
    setLocalVoiceReverbPreset(preset) {
        return AgoraRtcEngineModule.setLocalVoiceReverbPreset(preset);
    }
    enableSoundPositionIndication(enabled) {
        return AgoraRtcEngineModule.enableSoundPositionIndication(enabled);
    }
    setRemoteVoicePosition(uid, pan, gain) {
        return AgoraRtcEngineModule.setRemoteVoicePosition(uid, pan, gain);
    }
    addPublishStreamUrl(url, transcodingEnabled) {
        return AgoraRtcEngineModule.addPublishStreamUrl(url, transcodingEnabled);
    }
    removePublishStreamUrl(url) {
        return AgoraRtcEngineModule.removePublishStreamUrl(url);
    }
    setLiveTranscoding(transcoding) {
        return AgoraRtcEngineModule.setLiveTranscoding(transcoding);
    }
    startChannelMediaRelay(channelMediaRelayConfiguration) {
        return AgoraRtcEngineModule.startChannelMediaRelay(channelMediaRelayConfiguration);
    }
    stopChannelMediaRelay() {
        return AgoraRtcEngineModule.stopChannelMediaRelay();
    }
    updateChannelMediaRelay(channelMediaRelayConfiguration) {
        return AgoraRtcEngineModule.updateChannelMediaRelay(channelMediaRelayConfiguration);
    }
    isSpeakerphoneEnabled() {
        return AgoraRtcEngineModule.isSpeakerphoneEnabled();
    }
    setDefaultAudioRoutetoSpeakerphone(defaultToSpeaker) {
        return AgoraRtcEngineModule.setDefaultAudioRoutetoSpeakerphone(defaultToSpeaker);
    }
    setEnableSpeakerphone(enabled) {
        return AgoraRtcEngineModule.setEnableSpeakerphone(enabled);
    }
    enableInEarMonitoring(enabled) {
        return AgoraRtcEngineModule.enableInEarMonitoring(enabled);
    }
    setInEarMonitoringVolume(volume) {
        return AgoraRtcEngineModule.setInEarMonitoringVolume(volume);
    }
    enableDualStreamMode(enabled) {
        return AgoraRtcEngineModule.enableDualStreamMode(enabled);
    }
    setRemoteDefaultVideoStreamType(streamType) {
        return AgoraRtcEngineModule.setRemoteDefaultVideoStreamType(streamType);
    }
    setRemoteVideoStreamType(uid, streamType) {
        return AgoraRtcEngineModule.setRemoteVideoStreamType(uid, streamType);
    }
    setLocalPublishFallbackOption(option) {
        return AgoraRtcEngineModule.setLocalPublishFallbackOption(option);
    }
    setRemoteSubscribeFallbackOption(option) {
        return AgoraRtcEngineModule.setRemoteSubscribeFallbackOption(option);
    }
    setRemoteUserPriority(uid, userPriority) {
        return AgoraRtcEngineModule.setRemoteUserPriority(uid, userPriority);
    }
    disableLastmileTest() {
        return AgoraRtcEngineModule.disableLastmileTest();
    }
    enableLastmileTest() {
        return AgoraRtcEngineModule.enableLastmileTest();
    }
    startEchoTest(intervalInSeconds) {
        return AgoraRtcEngineModule.startEchoTest(intervalInSeconds);
    }
    startLastmileProbeTest(config) {
        return AgoraRtcEngineModule.startLastmileProbeTest(config);
    }
    stopEchoTest() {
        return AgoraRtcEngineModule.stopEchoTest();
    }
    stopLastmileProbeTest() {
        return AgoraRtcEngineModule.stopLastmileProbeTest();
    }
    registerMediaMetadataObserver() {
        return AgoraRtcEngineModule.registerMediaMetadataObserver();
    }
    sendMetadata(metadata) {
        return AgoraRtcEngineModule.sendMetadata(metadata);
    }
    setMaxMetadataSize(size) {
        return AgoraRtcEngineModule.setMaxMetadataSize(size);
    }
    unregisterMediaMetadataObserver() {
        return AgoraRtcEngineModule.unregisterMediaMetadataObserver();
    }
    addVideoWatermark(watermarkUrl, options) {
        return AgoraRtcEngineModule.addVideoWatermark(watermarkUrl, options);
    }
    clearVideoWatermarks() {
        return AgoraRtcEngineModule.clearVideoWatermarks();
    }
    setEncryptionMode(encryptionMode) {
        return AgoraRtcEngineModule.setEncryptionMode(encryptionMode);
    }
    setEncryptionSecret(secret) {
        return AgoraRtcEngineModule.setEncryptionSecret(secret);
    }
    startAudioRecording(filePath, sampleRate, quality) {
        return AgoraRtcEngineModule.startAudioRecording(filePath, sampleRate, quality);
    }
    stopAudioRecording() {
        return AgoraRtcEngineModule.stopAudioRecording();
    }
    addInjectStreamUrl(url, config) {
        return AgoraRtcEngineModule.addInjectStreamUrl(url, config);
    }
    removeInjectStreamUrl(url) {
        return AgoraRtcEngineModule.removeInjectStreamUrl(url);
    }
    enableFaceDetection(enable) {
        return AgoraRtcEngineModule.enableFaceDetection(enable);
    }
    getCameraMaxZoomFactor() {
        return AgoraRtcEngineModule.getCameraMaxZoomFactor();
    }
    isCameraAutoFocusFaceModeSupported() {
        return AgoraRtcEngineModule.isCameraAutoFocusFaceModeSupported();
    }
    isCameraExposurePositionSupported() {
        return AgoraRtcEngineModule.isCameraExposurePositionSupported();
    }
    isCameraFocusSupported() {
        return AgoraRtcEngineModule.isCameraFocusSupported();
    }
    isCameraTorchSupported() {
        return AgoraRtcEngineModule.isCameraTorchSupported();
    }
    isCameraZoomSupported() {
        return AgoraRtcEngineModule.isCameraZoomSupported();
    }
    setCameraAutoFocusFaceModeEnabled(enabled) {
        return AgoraRtcEngineModule.setCameraAutoFocusFaceModeEnabled(enabled);
    }
    setCameraCapturerConfiguration(config) {
        return AgoraRtcEngineModule.setCameraCapturerConfiguration(config);
    }
    setCameraExposurePosition(positionXinView, positionYinView) {
        return AgoraRtcEngineModule.setCameraExposurePosition(positionXinView, positionYinView);
    }
    setCameraFocusPositionInPreview(positionX, positionY) {
        return AgoraRtcEngineModule.setCameraFocusPositionInPreview(positionX, positionY);
    }
    setCameraTorchOn(isOn) {
        return AgoraRtcEngineModule.setCameraTorchOn(isOn);
    }
    setCameraZoomFactor(factor) {
        return AgoraRtcEngineModule.setCameraZoomFactor(factor);
    }
    switchCamera() {
        return AgoraRtcEngineModule.switchCamera();
    }
    createDataStream(reliable, ordered) {
        return AgoraRtcEngineModule.createDataStream(reliable, ordered);
    }
    sendStreamMessage(streamId, message) {
        return AgoraRtcEngineModule.sendStreamMessage(streamId, message);
    }
}
//# sourceMappingURL=RtcEngine.native.js.map