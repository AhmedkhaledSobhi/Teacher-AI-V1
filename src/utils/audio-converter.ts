/**
 * Converts an audio Blob (e.g. from react-media-recorder, usually audio/webm)
 * into a standard WAV file (audio/wav) that can be played or uploaded anywhere.
 * Uses Web Audio API for reliable cross-browser conversion.
 */
export async function convertBlobToWav(blob: Blob): Promise<Blob> {
  // If the blob is already WAV format, return it as-is
  if (blob.type === "audio/wav" || blob.type === "audio/wave") {
    return blob;
  }

  let audioContext: AudioContext | null = null;

  try {
    // Read the blob as an ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();

    // Create an AudioContext
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Decode the audio data
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    } catch (decodeError) {
      console.error("Failed to decode audio data:", decodeError);

      // If decoding fails, try to return the original blob
      // Some backends might be able to handle the original format
      console.warn("Returning original audio blob due to decode failure");
      return blob;
    }

    // Convert to WAV format
    const wavBuffer = audioBufferToWav(audioBuffer);
    const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

    return wavBlob;
  } catch (error) {
    console.error("Error converting audio to WAV:", error);

    // Return original blob as fallback
    console.warn("Returning original audio blob as fallback");
    return blob;
  } finally {
    // Close the audio context to free up resources
    if (audioContext && audioContext.state !== "closed") {
      try {
        await audioContext.close();
      } catch (closeError) {
        console.warn("Error closing AudioContext:", closeError);
      }
    }
  }
}

/**
 * Converts an AudioBuffer to WAV format
 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  // Interleave channels
  const interleaved = interleaveChannels(buffer);
  const dataLength = interleaved.length * bytesPerSample;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // Write WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Write audio data
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return arrayBuffer;
}

/**
 * Interleaves multiple audio channels into a single array
 */
function interleaveChannels(buffer: AudioBuffer): Float32Array {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels;
  const result = new Float32Array(length);

  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      result[offset++] = channels[channel][i];
    }
  }

  return result;
}

/**
 * Writes a string to a DataView at the specified offset
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
