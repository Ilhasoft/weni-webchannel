function loadLamejs() {
  if (window.lamejs) {
    return Promise.resolve(window.lamejs);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
    script.addEventListener('load', () => resolve(window.lamejs));
    document.head.appendChild(script);
  });
}

export function audioToMp3Blob(audioChunks, onSuccess) {
  loadLamejs().then(lamejs => {
    const wavBlob = new Blob(audioChunks, { type: 'audio/wav' });

    wavBlob.arrayBuffer().then(wavBuffer => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(wavBuffer).then(audioBuffer => {
        const numChannels = audioBuffer.numberOfChannels;

        const sampleRate = audioBuffer.sampleRate;
        const kbps = 128;
        const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps);

        const pcmData = audioBuffer.getChannelData(0);
        const samples = new Int16Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          samples[i] = pcmData[i] * 32767.5;
        }

        const mp3Data = [];
        const bufferSize = 1152;
        for (let i = 0; i < samples.length; i += bufferSize) {
          const sampleChunk = samples.subarray(i, i + bufferSize);
          const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
          if (mp3buf.length > 0) {
            mp3Data.push(new Int8Array(mp3buf));
          }
        }

        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
          mp3Data.push(new Int8Array(mp3buf));
        }

        const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });

        onSuccess(mp3Blob);
      });
    });
  });
}
