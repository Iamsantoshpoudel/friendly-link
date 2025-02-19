
type RTCPeerData = {
  userId: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
};

class WebRTCService {
  private peers: Map<string, RTCPeerData> = new Map();
  private localUserId: string | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;

  constructor() {
    this.setupConnectionListeners = this.setupConnectionListeners.bind(this);
    this.handleDataChannelMessage = this.handleDataChannelMessage.bind(this);
  }

  async initializePeer(localUserId: string): Promise<void> {
    console.log('Initializing peer with ID:', localUserId);
    this.localUserId = localUserId;
  }

  private async createPeerConnection(remoteUserId: string): Promise<RTCPeerConnection> {
    console.log('Creating peer connection for remote user:', remoteUserId);
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);
    const dataChannel = peerConnection.createDataChannel('messageChannel');
    
    this.setupConnectionListeners(peerConnection, remoteUserId);
    this.setupDataChannel(dataChannel);

    this.peers.set(remoteUserId, {
      userId: remoteUserId,
      connection: peerConnection,
      dataChannel,
    });

    return peerConnection;
  }

  private setupConnectionListeners(peerConnection: RTCPeerConnection, remoteUserId: string): void {
    console.log('Setting up connection listeners for:', remoteUserId);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          from: this.localUserId!,
          to: remoteUserId,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', peerConnection.connectionState);
    };

    peerConnection.ondatachannel = (event) => {
      console.log('Data channel received:', event.channel.label);
      const dataChannel = event.channel;
      this.setupDataChannel(dataChannel);
      
      const peerData = this.peers.get(remoteUserId);
      if (peerData) {
        this.peers.set(remoteUserId, { ...peerData, dataChannel });
      }
    };
  }

  private setupDataChannel(dataChannel: RTCDataChannel): void {
    dataChannel.onmessage = this.handleDataChannelMessage;
    dataChannel.onopen = () => console.log('Data channel opened');
    dataChannel.onclose = () => console.log('Data channel closed');
    dataChannel.onerror = (error) => console.error('Data channel error:', error);
  }

  private handleDataChannelMessage(event: MessageEvent): void {
    try {
      console.log('Received message through data channel:', event.data);
      const message = JSON.parse(event.data);
      if (this.onMessageCallback) {
        this.onMessageCallback(message);
      }
    } catch (error) {
      console.error('Error handling data channel message:', error);
    }
  }

  setMessageCallback(callback: (message: any) => void): void {
    this.onMessageCallback = callback;
  }

  async sendMessage(recipientId: string, message: any): Promise<void> {
    console.log('Sending message to:', recipientId, message);
    const peer = this.peers.get(recipientId);
    if (peer?.dataChannel?.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify(message));
    } else {
      console.error('Data channel not ready. State:', peer?.dataChannel?.readyState);
      // Try to re-establish connection
      await this.initiateConnection(recipientId);
      throw new Error('Data channel not ready, trying to reconnect');
    }
  }

  private async sendSignalingMessage(message: any): Promise<void> {
    console.log('Sending signaling message:', message);
    try {
      await fetch('/api/signaling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending signaling message:', error);
    }
  }

  async handleIncomingSignalingMessage(message: any): Promise<void> {
    console.log('Handling incoming signaling message:', message);
    if (!this.localUserId) return;

    switch (message.type) {
      case 'offer':
        await this.handleOffer(message);
        break;
      case 'answer':
        await this.handleAnswer(message);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
    }
  }

  private async handleOffer(message: any): Promise<void> {
    console.log('Handling offer from:', message.from);
    const peerConnection = await this.createPeerConnection(message.from);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    await this.sendSignalingMessage({
      type: 'answer',
      answer,
      from: this.localUserId,
      to: message.from,
    });
  }

  private async handleAnswer(message: any): Promise<void> {
    console.log('Handling answer from:', message.from);
    const peer = this.peers.get(message.from);
    if (peer?.connection) {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(message.answer));
    }
  }

  private async handleIceCandidate(message: any): Promise<void> {
    console.log('Handling ICE candidate from:', message.from);
    const peer = this.peers.get(message.from);
    if (peer?.connection) {
      await peer.connection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  }

  async initiateConnection(remoteUserId: string): Promise<void> {
    console.log('Initiating connection with:', remoteUserId);
    const peerConnection = await this.createPeerConnection(remoteUserId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await this.sendSignalingMessage({
      type: 'offer',
      offer,
      from: this.localUserId,
      to: remoteUserId,
    });
  }
}

export const webRTCService = new WebRTCService();
