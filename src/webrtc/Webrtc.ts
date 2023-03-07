// import 'webrtc-adapter';
import { RETRY_TIME } from "./constants";
import { Status } from "./enum";
import ObjectEvent from "./ObjectEvent";

export interface WebRTCOptions {
  /**
   * Your video element
   */
  media?: HTMLMediaElement | null;
  /**
   * Load source when construct
   */
  autoLoad?: boolean;
  /**
   * Retry time when disconnected
   */
  retryTime?: number;
  /**
   * Send offer and get answer
   * @param {string} localSdp
   * @returns {Promise<string>}
   */
  getRemoteSdp: (localSdp: string) => Promise<string>;
}

class Webrtc extends ObjectEvent {
  rtcPeerConnection: RTCPeerConnection;
  getRemoteSdp: WebRTCOptions["getRemoteSdp"];
  options: WebRTCOptions;
  retryCount = 0;
  status = Status.connecting;
  constructor(options: WebRTCOptions) {
    super();
    this.options = options;
    const { getRemoteSdp } = options;
    this.getRemoteSdp = getRemoteSdp;
    this.rtcPeerConnection = new RTCPeerConnection();
    this.init(options);
  }

  private async init({ media, autoLoad }: WebRTCOptions) {
    this.rtcPeerConnection.ontrack = (e) => {
      if (media) {
        media.srcObject = e.streams[0];
      }
    };

    this.rtcPeerConnection.addTransceiver("video", {
      direction: "recvonly",
      sendEncodings: [],
    });

    this.rtcPeerConnection.addTransceiver("audio", {
      direction: "recvonly",
      sendEncodings: [],
    });

    this.eventRegister();

    if (autoLoad) {
      await this.load();
    }
  }

  private changeStatus(status: Status) {
    this.status = status;
    this.dispatchEvent("status", this.status);
  }

  private eventRegister() {
    const { retryTime = RETRY_TIME } = this.options;
    this.rtcPeerConnection.oniceconnectionstatechange = () => {
      const { iceConnectionState } = this.rtcPeerConnection;
      switch (iceConnectionState) {
        case "new":
        case "checking":
          this.changeStatus(Status.connecting);
          break;
        case "connected":
        case "completed":
          this.changeStatus(Status.connected);
          break;
        case "disconnected":
          // 自动重连
          if (this.retryCount < retryTime) {
            this.changeStatus(Status.reconnecting);
            this.retryCount += 1;
            this.reload();
          } else {
            this.changeStatus(Status.disconnected);
          }
          break;
        case "failed":
          this.changeStatus(Status.failed);
          break;
        case "closed":
        default:
          this.changeStatus(Status.closed);
          break;
      }
    };
  }

  async getOffer(options?: RTCOfferOptions) {
    const offer = await this.rtcPeerConnection.createOffer(options);
    await this.rtcPeerConnection.setLocalDescription(offer);
    return offer;
  }

  async load() {
    if (this.getRemoteSdp) {
      const offer = await this.getOffer();
      if (offer.sdp) {
        try {
          this.retryCount = 0;
          const sdp = await this.getRemoteSdp(offer.sdp);
          await this.rtcPeerConnection.setRemoteDescription({
            type: "answer",
            sdp,
          });
          await this.options.media?.play();
        } catch (e: any) {
          this.changeStatus(Status.closed);
          this.dispatchEvent("error", e);
        }
      }
    }
  }

  async reload() {
    this.closeConnection();
    this.rtcPeerConnection = new RTCPeerConnection();
    await this.init({ ...this.options, autoLoad: true });
  }

  private closeConnection() {
    this.rtcPeerConnection.close();
  }

  destroy() {
    this.closeConnection();
    this.clearEvents();
  }
}

export default Webrtc;
