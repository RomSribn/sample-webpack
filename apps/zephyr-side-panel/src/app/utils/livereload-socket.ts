import { io, Socket } from 'socket.io-client';

import { getActiveTabId } from '.';

import { envValue } from '../../environments/env-value';

const updateActiveTab = async () => {
  const activeTabId = await getActiveTabId();
  if(!activeTabId) return;

  chrome.tabs.reload(activeTabId);
}

class LivereloadSocket {
  socket: Socket;
  constructor() {
    this.socket = io(envValue.value.ZEPHYR_API_ENDPOINT);
  }

  join(application_uid: string) {
    const roomSocket = this.socket.emit('joinZeMfLivereloadRoom', {
      application_uid,
    });

    roomSocket.on('reload', function (message) {
      console.log(message);
      setTimeout(() => updateActiveTab(), 250);
    });
  }

  leave(application_uid: string) {
    this.socket.emit('leaveZeMfLivereloadRoom', {
      application_uid,
    });
  }

  dispose() {
    this.socket.disconnect();
    this.socket.close();
  }

  connect() {
    this.socket.connect();
  }
}

export const livereloadSocket = new LivereloadSocket();
