const numNodes = 16
const audioCtx = new AudioContext()
const data = new Uint8Array(numNodes * 2)

const analyserNode = new AnalyserNode(audioCtx, {
  fftSize: Math.max(numNodes, 32),
  maxDecibels: -20,
  minDecibels: -80,
  smoothingTimeConstant: 0.8,
})

const updateVisualizer = () => {
  requestAnimationFrame(updateVisualizer)

  // Put FFT frequency data into our array
  analyserNode.getByteFrequencyData(data)
  // Render the amplitude of current audio stream as a number between 0-255
  document.getElementById('volume')!.textContent = `${data[0]}`
}

// Initiate the process of prompting the user for permission to access their audio, creating a 'source', and feeding
// that source into the analyser node so we can get cool FFT data, etc
const startStream = async () => {
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  })

  const source = await audioCtx.createMediaStreamSource(audioStream)
  source.connect(analyserNode)
  updateVisualizer()
}

// Let the user start things via a click event
document.addEventListener('click', () => {
  // We need to programatically resume the audio stream if we do it this way on click
  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  audioCtx.resume()
  startStream()
})
